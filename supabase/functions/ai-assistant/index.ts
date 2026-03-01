import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Generate embedding for the user query
    const embResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/text-embedding-004",
        input: [message],
      }),
    });

    let relevantChunks: any[] = [];

    if (embResponse.ok) {
      const embData = await embResponse.json();
      const queryEmbedding = embData.data?.[0]?.embedding;

      if (queryEmbedding) {
        // Step 2: Search for relevant document chunks
        const { data: chunks, error } = await supabase.rpc("match_document_chunks", {
          query_embedding: JSON.stringify(queryEmbedding),
          match_threshold: 0.3,
          match_count: 8,
        });

        if (!error && chunks) {
          // Fetch document titles for citations
          const docIds = [...new Set(chunks.map((c: any) => c.document_id))];
          const { data: docs } = await supabase
            .from("documents")
            .select("id, title, document_type")
            .in("id", docIds);

          const docMap = new Map((docs || []).map((d: any) => [d.id, d]));

          relevantChunks = chunks.map((c: any) => ({
            text: c.chunk_text,
            page: c.page_number,
            similarity: c.similarity,
            document: docMap.get(c.document_id) || { title: "Unknown", document_type: "general" },
          }));
        }
      }
    }

    // Also do a basic text search as fallback
    if (relevantChunks.length === 0) {
      const { data: textResults } = await supabase
        .from("document_chunks")
        .select("chunk_text, page_number, document_id")
        .eq("is_active", true)
        .ilike("chunk_text", `%${message.split(" ").slice(0, 3).join("%")}%`)
        .limit(5);

      if (textResults && textResults.length > 0) {
        const docIds = [...new Set(textResults.map((c: any) => c.document_id))];
        const { data: docs } = await supabase
          .from("documents")
          .select("id, title, document_type")
          .in("id", docIds);

        const docMap = new Map((docs || []).map((d: any) => [d.id, d]));

        relevantChunks = textResults.map((c: any) => ({
          text: c.chunk_text,
          page: c.page_number,
          similarity: 0.5,
          document: docMap.get(c.document_id) || { title: "Unknown", document_type: "general" },
        }));
      }
    }

    // Step 3: Build context from chunks
    const context = relevantChunks.length > 0
      ? relevantChunks
          .map((c, i) => `[Source ${i + 1}: "${c.document.title}" ${c.page ? `Page ${c.page}` : ""}]\n${c.text}`)
          .join("\n\n---\n\n")
      : "No relevant documents found in the knowledge base.";

    // Step 4: Generate response with citations
    const messages = [
      {
        role: "system",
        content: `You are a governance document assistant for Board_Vault. Answer questions using ONLY the provided document excerpts. Always cite your sources using [Source N] notation. If the documents don't contain relevant information, say so clearly. Be precise, professional, and concise.

Available document context:
${context}`,
      },
      ...(conversation_history || []).map((m: any) => ({
        role: m.role,
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const chatResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!chatResponse.ok) throw new Error("AI response failed");

    const chatData = await chatResponse.json();
    const answer = chatData.choices?.[0]?.message?.content || "I could not generate a response.";

    // Build citations array
    const citations = relevantChunks.map((c, i) => ({
      index: i + 1,
      document_title: c.document.title,
      document_type: c.document.type,
      page: c.page,
      similarity: c.similarity,
    }));

    return new Response(JSON.stringify({ answer, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e.message, answer: "Sorry, I encountered an error processing your request." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
