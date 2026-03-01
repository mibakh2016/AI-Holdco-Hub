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

    // Step 1: Extract search keywords from the user message
    const keywords = message
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !STOP_WORDS.has(w));

    let relevantChunks: any[] = [];

    // Step 2: Search document chunks using text matching
    if (keywords.length > 0) {
      // Search with each keyword using OR logic for broader results
      const searchPattern = keywords.slice(0, 6).map((k: string) => `%${k}%`);

      for (const pattern of searchPattern) {
        if (relevantChunks.length >= 10) break;
        const { data } = await supabase
          .from("document_chunks")
          .select("chunk_text, page_number, document_id")
          .eq("is_active", true)
          .ilike("chunk_text", pattern)
          .limit(5);

        if (data) {
          for (const row of data) {
            if (!relevantChunks.some((c) => c.chunk_text === row.chunk_text)) {
              relevantChunks.push(row);
            }
          }
        }
      }
    }

    // Step 3: Also search document metadata (titles, descriptions, AI summaries)
    const { data: matchingDocs } = await supabase
      .from("documents")
      .select("id, title, document_type, description, ai_suggested_metadata")
      .eq("status", "published")
      .limit(20);

    // Score documents by keyword relevance
    const scoredDocs = (matchingDocs || []).map((doc: any) => {
      const searchable = [
        doc.title,
        doc.description,
        doc.document_type,
        doc.ai_suggested_metadata?.summary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const score = keywords.reduce(
        (s: number, k: string) => s + (searchable.includes(k) ? 1 : 0),
        0
      );
      return { ...doc, score };
    });

    const topDocs = scoredDocs
      .filter((d: any) => d.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    // If we found relevant docs but no chunks, fetch their chunks
    if (relevantChunks.length === 0 && topDocs.length > 0) {
      const docIds = topDocs.map((d: any) => d.id);
      const { data: docChunks } = await supabase
        .from("document_chunks")
        .select("chunk_text, page_number, document_id")
        .eq("is_active", true)
        .in("document_id", docIds)
        .limit(10);

      if (docChunks) relevantChunks = docChunks;
    }

    // Step 4: Enrich chunks with document metadata
    const chunkDocIds = [...new Set(relevantChunks.map((c: any) => c.document_id))];
    let docMap = new Map<string, any>();

    if (chunkDocIds.length > 0) {
      const { data: docs } = await supabase
        .from("documents")
        .select("id, title, document_type, ai_suggested_metadata")
        .in("id", chunkDocIds);

      docMap = new Map((docs || []).map((d: any) => [d.id, d]));
    }

    const enrichedChunks = relevantChunks.map((c: any) => ({
      text: c.chunk_text,
      page: c.page_number,
      document: docMap.get(c.document_id) || { title: "Unknown", document_type: "general" },
    }));

    // Step 5: Fetch portfolio entities for company knowledge
    const { data: portfolioEntities } = await supabase
      .from("portfolio_entities")
      .select("name, sector, description, stake_percent, status, website_url, latest_milestone, logo_url")
      .order("name");

    let portfolioContext = "";
    if (portfolioEntities && portfolioEntities.length > 0) {
      portfolioContext = "\n\n--- Portfolio Entities ---\n" +
        portfolioEntities.map((e: any) => {
          const parts = [`• ${e.name}`];
          if (e.sector) parts.push(`Sector: ${e.sector}`);
          if (e.stake_percent) parts.push(`Stake: ${e.stake_percent}%`);
          if (e.status) parts.push(`Status: ${e.status}`);
          if (e.description) parts.push(`Description: ${e.description}`);
          if (e.latest_milestone) parts.push(`Latest Milestone: ${e.latest_milestone}`);
          if (e.website_url) parts.push(`Website: ${e.website_url}`);
          return parts.join(" | ");
        }).join("\n");
    }

    // Step 6: Build context
    let context = "";

    if (enrichedChunks.length > 0) {
      context = enrichedChunks
        .map(
          (c: any, i: number) =>
            `[Source ${i + 1}: "${c.document.title}" ${c.page ? `Page ${c.page}` : ""}]\n${c.text}`
        )
        .join("\n\n---\n\n");
    }

    // Add document summaries for broader context
    if (topDocs.length > 0) {
      const summaries = topDocs
        .map((d: any) => {
          const summary = d.ai_suggested_metadata?.summary || "";
          return `• "${d.title}" (${d.document_type})${summary ? `: ${summary}` : ""}`;
        })
        .join("\n");
      context += `\n\n--- Document Summaries ---\n${summaries}`;
    }

    // Always append portfolio entities context
    context += portfolioContext;

    if (!context.replace(portfolioContext, "").trim()) {
      // No document matches found, add available docs list
      const { data: allDocs } = await supabase
        .from("documents")
        .select("title, document_type")
        .eq("status", "published");

      if (allDocs && allDocs.length > 0) {
        context = `No specific document matches found. Available published documents:\n${allDocs
          .map((d: any) => `• "${d.title}" (${d.document_type})`)
          .join("\n")}` + portfolioContext;
      } else if (!portfolioContext) {
        context = "No documents or portfolio entities are currently available in the system.";
      }
    }

    // Step 7: Generate response
    const messages = [
      {
        role: "system",
        content: `You are a company info assistant for AI Holdco Hub. Answer questions using the provided document context and portfolio entity data. Always cite your sources using [Source N] notation when referencing specific document excerpts. When answering about portfolio companies, reference the portfolio data provided. If the information isn't available, say so clearly. Be precise, professional, and concise.

Available context:
${context}`,
      },
      ...(conversation_history || []).map((m: any) => ({
        role: m.role,
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const chatResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages,
        }),
      }
    );

    if (!chatResponse.ok) {
      const errText = await chatResponse.text();
      console.error("AI response error:", chatResponse.status, errText);

      if (chatResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later.", answer: "I'm currently rate-limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (chatResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required.", answer: "AI credits have been exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI response failed");
    }

    const chatData = await chatResponse.json();
    const answer =
      chatData.choices?.[0]?.message?.content ||
      "I could not generate a response.";

    const citations = enrichedChunks.map((c: any, i: number) => ({
      index: i + 1,
      document_title: c.document.title,
      document_type: c.document.document_type,
      page: c.page,
    }));

    return new Response(JSON.stringify({ answer, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: message,
        answer: "Sorry, I encountered an error processing your request.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "has", "have", "been", "some", "them",
  "than", "its", "over", "such", "that", "this", "with", "will", "each",
  "from", "they", "were", "which", "their", "said", "what", "about",
  "would", "make", "like", "into", "could", "time", "very", "when", "come",
  "just", "know", "take", "people", "also", "how", "after", "should",
  "well", "because", "these", "give", "most", "does", "where", "who",
]);
