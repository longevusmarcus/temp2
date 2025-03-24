// Test webhook to verify Supabase connection and data flow
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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
    // Log request information
    console.log("Test webhook received request");
    console.log("Headers:", Object.fromEntries(req.headers.entries()));

    // Get request body
    let body = {};
    try {
      body = await req.json();
      console.log("Request body:", body);
    } catch (e) {
      console.error("Error parsing request body:", e);
      body = { error: "Could not parse request body" };
    }

    // Test database connection
    console.log("Testing Supabase connection...");
    const connectionTest = await supabase.from("webhook_logs").insert({
      event_type: "test_webhook",
      payload: { test: true, timestamp: new Date().toISOString(), body },
      status: "received",
    });

    if (connectionTest.error) {
      console.error("Supabase connection test failed:", connectionTest.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: connectionTest.error,
          message: "Failed to connect to Supabase",
          supabaseUrl: supabaseUrl ? "Set" : "Not set",
          supabaseKey: supabaseServiceKey ? "Set (masked)" : "Not set",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Test inserting a mock project
    console.log("Testing project insertion...");
    const mockProject = {
      project_name: "Test Project",
      developer_name: "Test Developer",
      description: "Test project created by webhook test",
      website_url: "https://example.com",
      x: 500,
      y: 500,
      width: 10,
      height: 10,
      color: "#ff5588",
      category: "test",
    };

    const projectTest = await supabase.from("projects").insert(mockProject);

    if (projectTest.error) {
      console.error("Project insertion test failed:", projectTest.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: projectTest.error,
          message: "Failed to insert test project",
          connectionTestSuccess: true,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // If we got here, both tests passed
    return new Response(
      JSON.stringify({
        success: true,
        message: "Supabase connection and project insertion tests passed",
        timestamp: new Date().toISOString(),
        env: {
          supabaseUrl: supabaseUrl ? "Set" : "Not set",
          supabaseKey: supabaseServiceKey ? "Set (masked)" : "Not set",
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error in test webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
