// A simple edge function to test connectivity to Supabase

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

    // Check if environment variables are set
    const envStatus = {
      supabaseUrl: supabaseUrl ? "set" : "not set",
      supabaseServiceKey: supabaseServiceKey ? "set" : "not set",
    };

    // Return a simple response with timestamp
    const data = {
      message: "Connectivity test successful",
      timestamp: new Date().toISOString(),
      environment: envStatus,
    };

    return new Response(JSON.stringify(data), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }
});
