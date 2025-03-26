// Simple function to test environment variables

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get all environment variables (without values for security)
    const envVars = Object.keys(Deno.env.toObject());

    // Check for specific variables
    const hasSupabaseUrl =
      !!Deno.env.get("SUPABASE_URL") || !!Deno.env.get("VITE_SUPABASE_URL");
    const hasServiceKey =
      !!Deno.env.get("SUPABASE_SERVICE_KEY") ||
      !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const hasAnonKey = !!Deno.env.get("VITE_SUPABASE_ANON_KEY");
    const hasProjectId =
      !!Deno.env.get("VITE_SUPABASE_PROJECT_ID") ||
      !!Deno.env.get("SUPABASE_PROJECT_ID");

    const data = {
      message: `Environment variables check`,
      envVarCount: envVars.length,
      envVarNames: envVars,
      checks: {
        hasSupabaseUrl,
        hasServiceKey,
        hasAnonKey,
        hasProjectId,
      },
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
