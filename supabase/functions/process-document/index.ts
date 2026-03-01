import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DOCUMENT_TYPES = [
  "investment_agreement",
  "subscription_agreement",
  "purchase_agreement",
  "ppm",
  "valuation_report",
  "board_resolution",
  "sec_filing",
  "shareholder_record",
  "portfolio_entity_record",
  "financial_report",
  "meeting_minutes",
  "bylaws",
  "operating_agreement",
  "annual_report",
  "tax_document",
  "general",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let documentId: string | null = null;

  try {
    const payload = await req.json();
    documentId = payload?.document_id ?? null;
    if (!documentId) {
      return new Response(JSON.stringify({ error: "document_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch document
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (docErr || !doc) throw new Error("Document not found");

    // Update processing status
    await supabase
      .from("documents")
      .update({ processing_status: "extracting" })
      .eq("id", documentId);

    // Download the PDF from storage
    const filePath = doc.file_url?.split("/documents/")[1];
    if (!filePath) throw new Error("No file path found");

    const { data: fileData, error: dlErr } = await supabase.storage
      .from("documents")
      .download(decodeURIComponent(filePath));
    if (dlErr || !fileData) throw new Error("Failed to download file");

    // Convert to base64 for AI processing
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Step 1: Extract text and metadata using AI vision
    console.log("Extracting text from PDF...");
    const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a document processing assistant. Extract all text content from the PDF and analyze it to suggest metadata. Return structured data using the provided function.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this PDF document titled "${doc.title}". Extract ALL text content page by page, and suggest metadata fields.`,
              },
              {
                type: "image_url",
                image_url: { url: `data:application/pdf;base64,${base64}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "process_document",
              description: "Process extracted document content and metadata",
              parameters: {
                type: "object",
                properties: {
                  extracted_text: {
                    type: "string",
                    description: "Full extracted text from the document, preserving page breaks with [PAGE X] markers",
                  },
                  suggested_type: {
                    type: "string",
                    enum: DOCUMENT_TYPES,
                    description: "Suggested document category",
                  },
                  suggested_shareholder_name: {
                    type: "string",
                    description: "Name of related shareholder if found in document",
                  },
                  suggested_entity_name: {
                    type: "string",
                    description: "Name of related portfolio entity/company if found",
                  },
                  suggested_effective_date: {
                    type: "string",
                    description: "Effective date in YYYY-MM-DD format if found",
                  },
                  ownership_percentage: {
                    type: "number",
                    description: "Ownership percentage if found in document",
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                  },
                  summary: {
                    type: "string",
                    description: "Brief 2-3 sentence summary of the document",
                  },
                },
                required: ["extracted_text", "suggested_type", "confidence", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "process_document" } },
      }),
    });

    if (!extractResponse.ok) {
      const errText = await extractResponse.text();
      console.error("AI extraction error:", extractResponse.status, errText);
      throw new Error("AI text extraction failed");
    }

    const extractData = await extractResponse.json();
    const toolCall = extractData.choices?.[0]?.message?.tool_calls?.[0];

    let result = {
      extracted_text: "",
      suggested_type: "general",
      suggested_shareholder_name: null as string | null,
      suggested_entity_name: null as string | null,
      suggested_effective_date: null as string | null,
      ownership_percentage: null as number | null,
      confidence: "low",
      summary: "",
    };

    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        result = { ...result, ...args };
      } catch {
        console.error("Failed to parse extraction result");
      }
    }

    // Update document with extracted text and AI suggestions
    await supabase
      .from("documents")
      .update({
        extracted_text: result.extracted_text,
        document_type: result.suggested_type,
        ai_suggested_metadata: {
          suggested_type: result.suggested_type,
          suggested_shareholder_name: result.suggested_shareholder_name,
          suggested_entity_name: result.suggested_entity_name,
          suggested_effective_date: result.suggested_effective_date,
          ownership_percentage: result.ownership_percentage,
          confidence: result.confidence,
          summary: result.summary,
        },
        processing_status: "awaiting_confirmation",
      })
      .eq("id", documentId);

    // Step 2: Chunk the text and generate embeddings
    if (result.extracted_text) {
      await chunkAndEmbed(supabase, documentId, result.extracted_text, LOVABLE_API_KEY);
    }

    return new Response(JSON.stringify({
      status: "processed",
      suggested_metadata: result,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-document error:", e);

    if (documentId) {
      await supabase
        .from("documents")
        .update({ processing_status: "failed" })
        .eq("id", documentId);
    }

    const message = e instanceof Error ? e.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function chunkAndEmbed(
  supabase: any,
  documentId: string,
  text: string,
  apiKey: string
) {
  // Split text into chunks (~500 tokens ≈ ~2000 chars) with overlap
  const CHUNK_SIZE = 2000;
  const OVERLAP = 200;
  const chunks: { text: string; page: number | null }[] = [];

  // Try to split by page markers first
  const pageRegex = /\[PAGE (\d+)\]/g;
  const pages = text.split(pageRegex);

  if (pages.length > 1) {
    // We have page markers
    let currentPage = 1;
    for (let i = 0; i < pages.length; i++) {
      const segment = pages[i].trim();
      if (!segment) continue;
      if (/^\d+$/.test(segment)) {
        currentPage = parseInt(segment);
        continue;
      }
      // Chunk this page's text
      for (let j = 0; j < segment.length; j += CHUNK_SIZE - OVERLAP) {
        const chunk = segment.slice(j, j + CHUNK_SIZE);
        if (chunk.trim().length > 50) {
          chunks.push({ text: chunk.trim(), page: currentPage });
        }
      }
    }
  } else {
    // No page markers, chunk the whole text
    for (let i = 0; i < text.length; i += CHUNK_SIZE - OVERLAP) {
      const chunk = text.slice(i, i + CHUNK_SIZE);
      if (chunk.trim().length > 50) {
        chunks.push({ text: chunk.trim(), page: null });
      }
    }
  }

  if (chunks.length === 0) return;

  // Generate embeddings in batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const textsToEmbed = batch.map((c) => c.text);

    try {
      // Use Gemini embedding model via gateway
      const embResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/text-embedding-004",
          input: textsToEmbed,
        }),
      });

      if (!embResponse.ok) {
        console.error("Embedding error:", await embResponse.text());
        // Store chunks without embeddings
        const rows = batch.map((c) => ({
          document_id: documentId,
          page_number: c.page,
          chunk_text: c.text,
          is_active: true,
        }));
        await supabase.from("document_chunks").insert(rows);
        continue;
      }

      const embData = await embResponse.json();
      const embeddings = embData.data || [];

      const rows = batch.map((c, idx) => ({
        document_id: documentId,
        page_number: c.page,
        chunk_text: c.text,
        embedding: embeddings[idx]?.embedding
          ? JSON.stringify(embeddings[idx].embedding)
          : null,
        is_active: true,
      }));

      await supabase.from("document_chunks").insert(rows);
    } catch (err) {
      console.error("Chunk embedding error:", err);
      // Store without embeddings as fallback
      const rows = batch.map((c) => ({
        document_id: documentId,
        page_number: c.page,
        chunk_text: c.text,
        is_active: true,
      }));
      await supabase.from("document_chunks").insert(rows);
    }
  }
}
