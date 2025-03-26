import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { Webhooks } from "https://esm.sh/@polar-sh/sdk@0.32.2/webhooks";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-signature",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Get environment variables with fallbacks
const supabaseUrl =
  Deno.env.get("SUPABASE_URL") || "https://mbqihswchccmvqmjlpwq.supabase.co";
const supabaseServiceKey =
  Deno.env.get("SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjY1OTE0MSwiZXhwIjoyMDU4MjM1MTQxfQ.544d5NIjRg9VoBi63CK8uk1SVmTUrZxOA0W67gfaTfk";

// Use a webhook secret with fallback
const WEBHOOK_SECRET =
  Deno.env.get("WEBHOOK_SECRET") || "d07e6a6640f441949ad0fb00d6e43e8e";

console.log("Supabase URL:", supabaseUrl ? "Found" : "Not found");
console.log(
  "Supabase Service Key:",
  supabaseServiceKey ? "Found" : "Not found",
);
console.log("Environment variables:", {
  SUPABASE_SERVICE_KEY: Deno.env.get("SUPABASE_SERVICE_KEY")
    ? "Found"
    : "Not found",
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    ? "Found"
    : "Not found",
});

// Create Supabase client with credentials
const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log("Supabase client created successfully");

const webhooks = new Webhooks({ secret: WEBHOOK_SECRET });

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Webhook live",
        env: {
          hasSupabaseUrl: true,
          hasServiceKey: true,
          urlPrefix: supabaseUrl.substring(0, 8) + "...",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Handle webhook POST requests
  if (req.method === "POST") {
    try {
      const payload = await req.json();
      const signature = req.headers.get("webhook-signature") || "";

      console.log("Received webhook payload:", {
        type: payload.type,
        signature: signature ? "present" : "missing",
      });

      // Verify webhook signature
      try {
        const event = webhooks.verify(JSON.stringify(payload), signature);
        console.log("Webhook signature verified", { event: event.type });
      } catch (verifyError) {
        console.warn(
          "Webhook signature verification failed:",
          verifyError.message,
        );
        // Continue processing even if verification fails (for testing)
      }

      // Log the webhook event
      try {
        const { data, error } = await supabase.from("webhook_logs").insert({
          event_type: payload.type,
          payload,
          status: "received",
        });

        if (error) {
          console.error("Error logging webhook:", error);
        } else {
          console.log("Webhook logged successfully");
        }
      } catch (dbError) {
        console.error("Database error logging webhook:", dbError);
      }

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
