import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Extract user's auth token and fetch their applications
    const authHeader = req.headers.get("authorization") ?? "";
    let appContext = "";

    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: apps } = await supabase
          .from("applications")
          .select("company, role, status, date_applied, tags, notes, job_link")
          .order("date_applied", { ascending: false })
          .limit(100);

        if (apps && apps.length > 0) {
          const summary = apps.map((a) =>
            `- ${a.company} | ${a.role} | ${a.status} | Applied: ${a.date_applied}${a.tags?.length ? ` | Tags: ${a.tags.join(", ")}` : ""}${a.notes ? ` | Notes: ${a.notes}` : ""}`
          ).join("\n");

          const statusCounts: Record<string, number> = {};
          apps.forEach((a) => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });
          const statsLine = Object.entries(statusCounts).map(([s, c]) => `${s}: ${c}`).join(", ");

          appContext = `\n\nThe user has ${apps.length} job applications tracked:\nStatus breakdown: ${statsLine}\n\nFull list:\n${summary}`;
        } else {
          appContext = "\n\nThe user has no job applications tracked yet.";
        }
      }
    }

    const systemPrompt = `You are JobTracker Assistant, a helpful AI that answers questions about the user's job applications, job searching, interview preparation, resume writing, salary negotiation, and career advice. Keep answers clear, practical, and concise. Use markdown formatting when helpful.

You have access to the user's job application data. Use it to answer their questions accurately.${appContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
