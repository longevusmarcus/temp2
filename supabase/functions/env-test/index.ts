// Simple function to test environment variables

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Hardcoded credentials as fallback
const supabaseUrl =
  Deno.env.get("SUPABASE_URL") ||
  Deno.env.get("VITE_SUPABASE_URL") ||
  "https://mbqihswchccmvqmjlpwq.supabase.co";

const supabaseServiceKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
  Deno.env.get("SERVICE_ROLE_KEY") ||
  Deno.env.get("VITE_SUPABASE_SERVICE_KEY") ||
  Deno.env.get("SUPABASE_SERVICE_KEY") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQzNjgwMCwiZXhwIjoyMDA5MDEyODAwfQ.Ow-_JWmWlNm8gVMdPVoLbXNUoaUxKtU_cOIp-cNVxDM";

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get all environment variables (without values for security)
    const envVars = Object.keys(Deno.env.toObject());

    // Check for specific variables
    const hasServiceRoleKey = !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const hasSupabaseUrl =
      !!Deno.env.get("SUPABASE_URL") || !!Deno.env.get("VITE_SUPABASE_URL");

    const data = {
      message: `Environment variables check`,
      envVars: envVars,
      hasServiceRoleKey: hasServiceRoleKey,
      hasSupabaseUrl: hasSupabaseUrl,
      usingHardcodedCredentials: !hasServiceRoleKey || !hasSupabaseUrl,
      supabaseUrlPrefix: supabaseUrl
        ? supabaseUrl.substring(0, 8) + "..."
        : "not set",
      supabaseKeyStatus: supabaseServiceKey ? "set (masked)" : "not set",
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
