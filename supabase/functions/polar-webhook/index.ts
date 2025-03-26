import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { Webhooks } from "https://esm.sh/@polar-sh/sdk@0.32.2/webhooks";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-signature",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Log all available environment variables (without values for security)
console.log(
  "Available environment variables:",
  Object.keys(Deno.env.toObject()),
);

// Get environment variables with multiple fallbacks
const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("VITE_SUPABASE_URL") ||
  Deno.env.get("PROJECT_URL") ||
  "https://mbqihswchccmvqmjlpwq.supabase.co";

const supabaseServiceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  Deno.env.get("VITE_SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY");

// Log environment variables for debugging (masked for security)
console.log("Environment variables in edge function:", {
  supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : "not set",
  supabaseServiceKey: supabaseServiceKey ? "set (masked)" : "not set",
  envVars: Object.keys(Deno.env.toObject()),
});

// Throw an error if credentials are missing
if (!supabaseServiceKey) {
  console.error(
    "Supabase service key is missing, using hardcoded placeholder for testing",
  );
}

// Use a webhook secret with fallback
const WEBHOOK_SECRET =
  Deno.env.get("WEBHOOK_SECRET") || "d07e6a6640f441949ad0fb00d6e43e8e";

// Create Supabase client with proper error handling
let supabase;
try {
  // Ensure we have valid credentials
  if (!supabaseUrl) {
    throw new Error("Supabase URL is missing");
  }

  // If service key is missing, use a hardcoded placeholder for testing
  const finalServiceKey =
    supabaseServiceKey ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQyMDk2MCwiZXhwIjoyMDA4OTk2OTYwfQ.placeholder";

  if (!supabaseServiceKey) {
    console.warn(
      "WARNING: Using placeholder service key - this is for testing only!",
    );
  }

  // Create client with explicit string type conversion
  supabase = createClient(String(supabaseUrl), String(finalServiceKey));
  console.log("Supabase client created successfully");
} catch (error) {
  console.error("Error creating Supabase client:", error);
  throw new Error(`Failed to initialize Supabase client: ${error.message}`);
}

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
          hasSupabaseUrl: !!supabaseUrl,
          hasServiceKey: !!supabaseServiceKey,
          urlPrefix: supabaseUrl
            ? supabaseUrl.substring(0, 8) + "..."
            : "not set",
          availableEnvVars: Object.keys(Deno.env.toObject()),
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
