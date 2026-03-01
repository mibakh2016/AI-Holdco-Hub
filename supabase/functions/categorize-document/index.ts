import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = [
  "subscription_agreement",
  "board_resolution",
  "financial_report",
  "shareholder_agreement",
  "bylaws",
  "operating_agreement",
  "annual_report",
  "tax_document",
  "meeting_minutes",
  "general",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { document_id, title } = await req.json();
    if (!document_id || !title) {
      return new Response(JSON.stringify({ error: "document_id and title are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a document classification assistant. Given a document filename/title, classify it into the most appropriate governance document category.",
          },
          {
            role: "user",
            content: `Classify this document: "${title}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_document",
              description: "Classify a document into a governance category.",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: CATEGORIES,
                    description: "The document category.",
                  },
                  confidence: {
                    type: "string",
                    enum: ["high", "medium", "low"],
                    description: "Confidence level of the classification.",
                  },
                },
                required: ["category", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_document" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ category: "general", confidence: "low", error: "AI classification failed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let category = "general";
    let confidence = "low";

    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        if (CATEGORIES.includes(args.category)) category = args.category;
        if (["high", "medium", "low"].includes(args.confidence)) confidence = args.confidence;
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // Update document in DB using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: updateError } = await supabase
      .from("documents")
      .update({ document_type: category })
      .eq("id", document_id);

    if (updateError) console.error("DB update error:", updateError);

    return new Response(JSON.stringify({ category, confidence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("categorize-document error:", e);
    return new Response(
      JSON.stringify({ category: "general", confidence: "low", error: e.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
