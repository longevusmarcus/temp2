import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { Webhooks } from "https://esm.sh/@polar-sh/sdk@0.32.2/webhooks";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-signature",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Get environment variables properly
const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("VITE_SUPABASE_URL") ||
  Deno.env.get("PROJECT_URL");
const supabaseServiceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  Deno.env.get("VITE_SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY");

// Log environment variables for debugging (masked for security)
console.log("Environment variables in edge function:", {
  supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : "not set",
  supabaseServiceKey: supabaseServiceKey ? "set (masked)" : "not set",
});

// Throw an error if credentials are missing
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase credentials not found");
}

const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "changeme-in-prod";

// Create Supabase client with proper error handling
let supabase;
try {
  console.log("Creating Supabase client with URL and key");
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} catch (error) {
  console.error("Error creating Supabase client:", error);
  throw new Error(`Failed to initialize Supabase client: ${error.message}`);
}

const webhooks = new Webhooks({ secret: WEBHOOK_SECRET });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Webhook live",
        env: {
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          urlPrefix: supabaseUrl
            ? supabaseUrl.substring(0, 8) + "..."
            : "not set",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (req.method === "POST") {
    try {
      const payload = await req.json();
      const signature = req.headers.get("webhook-signature") || "";

      const event = webhooks.verify(JSON.stringify(payload), signature);

      await supabase.from("webhook_logs").insert({
        event_type: payload.type,
        payload,
        status: "received",
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (err) {
      console.error("Webhook error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 405,
  });
});
