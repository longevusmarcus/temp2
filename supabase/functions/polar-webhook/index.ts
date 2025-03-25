import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { Webhooks } from "https://esm.sh/@polar-sh/sdk@0.32.2/webhooks";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-signature",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Log the request URL for debugging
console.log("Request URL:", Deno.env.get("SUPABASE_URL"));

// Get environment variables
// Get Supabase URL and service key directly from environment
// Try multiple possible environment variable names
const supabaseUrl = "https://mbqihswchccmvqmjlpwq.supabase.co";

const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjY1OTE0MSwiZXhwIjoyMDU4MjM1MTQxfQ.544d5NIjRg9VoBi63CK8uk1SVmTUrZxOA0W67gfaTfk";

// Check if environment variables are loaded properly
if (false) {
  console.error("Missing Supabase credentials:", {
    supabaseUrlSet: !!supabaseUrl,
    supabaseServiceKeySet: !!supabaseServiceKey,
    availableEnvVars: Object.keys(Deno.env.toObject()),
  });

  // Log all environment variables for debugging (without exposing values)
  console.log(
    "Available environment variables:",
    Object.keys(Deno.env.toObject()).map((key) => {
      return {
        name: key,
        hasValue: !!Deno.env.get(key),
        valuePreview: Deno.env.get(key)
          ? `${Deno.env.get(key)?.substring(0, 3)}...`
          : "<empty>",
      };
    }),
  );
}

// Normalize URL by removing trailing slash if present
const normalizedSupabaseUrl =
  supabaseUrl && supabaseUrl.endsWith("/")
    ? supabaseUrl.slice(0, -1)
    : supabaseUrl || "";

// Fallback to other env vars if primary ones are not available
const finalSupabaseUrl = normalizedSupabaseUrl || "";

// For the key, try service key first, then anon key as last resort
const finalSupabaseKey =
  supabaseServiceKey ||
  Deno.env.get("VITE_SUPABASE_ANON_KEY") ||
  Deno.env.get("SUPABASE_ANON_KEY") ||
  "";

const WEBHOOK_SECRET =
  Deno.env.get("WEBHOOK_SECRET") || "d07e6a6640f441949ad0fb00d6e43e8e";

// Create Supabase client
const supabase = createClient(finalSupabaseUrl, finalSupabaseKey);

// Log Supabase configuration (without exposing full keys)
console.log("Polar webhook Supabase configuration:", {
  primaryUrlSet: !!supabaseUrl,
  primaryServiceKeySet: !!supabaseServiceKey,
  finalUrl: finalSupabaseUrl
    ? `${finalSupabaseUrl.substring(0, 10)}...`
    : "NOT SET",
  finalServiceKey: finalSupabaseKey ? "SET (masked)" : "NOT SET",
  envVars: Object.keys(Deno.env.toObject()).filter(
    (key) =>
      key.includes("SUPABASE") ||
      key.includes("VITE_SUPABASE") ||
      key === "PROJECT_URL" ||
      key === "SERVICE_ROLE_KEY",
  ),
});

// Initialize Polar webhooks
const webhooks = new Webhooks({
  secret: WEBHOOK_SECRET,
});

// Helper function for random color generation
function getRandomColor(): string {
  const colors = [
    "#ff5588",
    "#5588ff",
    "#44cc88",
    "#ffaa22",
    "#33ccff",
    "#ff33cc",
    "#cc33ff",
    "#33ffcc",
    "#ffcc33",
    "#3366ff",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get block dimensions based on size
function getBlockDimensions(blockSize: string): {
  width: number;
  height: number;
} {
  switch (blockSize) {
    case "small":
      return { width: 10, height: 10 };
    case "medium":
      return { width: 20, height: 20 };
    case "large":
      return { width: 50, height: 50 };
    default:
      return { width: 20, height: 20 }; // Default to medium
  }
}

// Main handler function for all requests
Deno.serve(async (req) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Handle GET request for testing connectivity
  if (req.method === "GET") {
    // Check if environment variables are loaded properly
    if (!finalSupabaseUrl || !finalSupabaseKey) {
      console.error("Missing Supabase credentials on GET request:", {
        primaryUrlSet: !!supabaseUrl,
        primaryServiceKeySet: !!supabaseServiceKey,
        finalUrlSet: !!finalSupabaseUrl,
        finalServiceKeySet: !!finalSupabaseKey,
      });

      return new Response(
        JSON.stringify({
          status: "error",
          message: "Missing Supabase credentials",
          details: {
            primaryUrlSet: !!supabaseUrl,
            primaryServiceKeySet: !!supabaseServiceKey,
            finalUrlSet: !!finalSupabaseUrl,
            finalServiceKeySet: !!finalSupabaseKey,
            availableEnvVars: Object.keys(Deno.env.toObject()).filter(
              (key) =>
                key.includes("SUPABASE") || key.includes("VITE_SUPABASE"),
            ),
          },
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        },
      );
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        message: "Polar webhook is running",
        envStatus: {
          primaryUrlSet: !!supabaseUrl,
          primaryServiceKeySet: !!supabaseServiceKey,
          finalUrlSet: !!finalSupabaseUrl,
          finalServiceKeySet: !!finalSupabaseKey,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  }

  // Handle POST request for webhook
  if (req.method === "POST") {
    try {
      // Log the request
      console.log("webhook.handler_called", {
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        timestamp: new Date().toISOString(),
      });

      // Get the raw payload and signature
      const payload = await req.json();
      const signature = req.headers.get("webhook-signature") || "";

      console.log("webhook.payload_received", {
        payloadSize: JSON.stringify(payload).length,
        hasSignature: !!signature,
        timestamp: new Date().toISOString(),
      });

      // Verify the webhook signature
      let event;
      try {
        console.log("webhook.validate_signature_attempt", {
          signatureLength: signature ? signature.length : 0,
          timestamp: new Date().toISOString(),
        });
        event = webhooks.verify(JSON.stringify(payload), signature);
      } catch (err) {
        console.error("Invalid webhook signature", err);
        console.log("webhook.signature_validation_failed", {
          error: err.message,
          timestamp: new Date().toISOString(),
        });
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        });
      }

      console.log("webhook.signature_validated", {
        timestamp: new Date().toISOString(),
      });

      // Log the webhook event for debugging
      console.log("Received webhook:", JSON.stringify(payload));
      console.log("Webhook type:", payload.type);
      console.log("Webhook data:", JSON.stringify(payload.data));

      try {
        await supabase.from("webhook_logs").insert({
          event_type: payload.type || "unknown",
          payload: payload,
          headers: Object.fromEntries(req.headers.entries()),
          status: "received",
        });
      } catch (logError) {
        console.error("Error logging webhook:", logError);
        // Continue processing even if logging fails
      }

      // Handle various Polar webhook events
      console.log("webhook.processing_event_type", {
        type: payload.type,
        hasData: !!payload.data,
        timestamp: new Date().toISOString(),
      });

      if (
        (payload.type === "customer.state_changed" ||
          payload.type === "checkout.completed" ||
          payload.type === "subscription.created" ||
          payload.type === "subscription.renewed") &&
        payload.data
      ) {
        console.log("webhook.processing_payment_event", {
          type: payload.type,
          timestamp: new Date().toISOString(),
        });
        // Get the checkout session ID from the payload
        const checkoutId = payload.data.checkout_id;

        console.log("webhook.checkout_id_check", {
          hasCheckoutId: !!checkoutId,
          checkoutId: checkoutId || "MISSING",
          timestamp: new Date().toISOString(),
        });

        if (!checkoutId) {
          console.error("No checkout ID in webhook payload");
          return new Response(
            JSON.stringify({ error: "No checkout ID provided" }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            },
          );
        }

        // Get the checkout session details with detailed error handling
        console.log("webhook.lookup_checkout_start", {
          checkoutId: checkoutId,
          timestamp: new Date().toISOString(),
        });
        const checkoutResult = await supabase
          .from("polar_checkouts")
          .select("*")
          .eq("checkout_id", checkoutId)
          .single();

        let { data: checkoutData, error: checkoutError } = checkoutResult;

        // Log the full response for debugging
        console.log("Checkout lookup result:", JSON.stringify(checkoutResult));

        if (checkoutError) {
          console.error("Checkout lookup error details:", {
            message: checkoutError.message,
            code: checkoutError.code,
            details: checkoutError.details,
            hint: checkoutError.hint,
          });
        }

        if (checkoutError || !checkoutData) {
          console.error("Error fetching checkout data:", checkoutError);

          // If checkout not found, create it from the webhook payload
          if (checkoutError && checkoutError.code === "PGRST116") {
            console.log(
              "Checkout not found, attempting to create it from webhook data",
            );

            try {
              // Extract data from the webhook payload
              const newCheckoutData = {
                checkout_id: checkoutId,
                email:
                  payload.data.email || payload.data.customer?.email || null,
                status: payload.data.status || "pending",
                metadata: payload.data.metadata || {},
                processed: false,
              };

              console.log(
                "Creating new checkout record:",
                JSON.stringify(newCheckoutData),
              );

              const { data: insertedData, error: insertError } = await supabase
                .from("polar_checkouts")
                .insert(newCheckoutData)
                .select();

              if (insertError) {
                console.error("Failed to create checkout record:", insertError);
              } else {
                console.log(
                  "Successfully created checkout record:",
                  insertedData,
                );
                // Use the newly created checkout data
                checkoutData = insertedData[0];
              }
            } catch (createError) {
              console.error("Error creating checkout record:", createError);
            }
          }

          // If we still don't have checkout data, return error
          if (!checkoutData) {
            return new Response(
              JSON.stringify({
                error: "Checkout not found",
                details: checkoutError,
                webhookType: payload.type,
                checkoutId: checkoutId,
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 404,
              },
            );
          }
        }

        // Check if payment is successful
        const isCustomerStateChanged =
          payload.type === "customer.state_changed" &&
          payload.data.state === "active";
        const isCheckoutCompleted =
          payload.type === "checkout.completed" &&
          (payload.data.status === "completed" ||
            payload.data.status === "succeeded");
        const isSubscriptionCreated =
          payload.type === "subscription.created" &&
          payload.data.status === "active";
        const isSubscriptionRenewed =
          payload.type === "subscription.renewed" &&
          payload.data.status === "active";

        console.log("webhook.payment_status_check", {
          isCustomerStateChanged,
          isCheckoutCompleted,
          isSubscriptionCreated,
          isSubscriptionRenewed,
          payloadType: payload.type,
          payloadState: payload.data.state,
          payloadStatus: payload.data.status,
          timestamp: new Date().toISOString(),
        });

        if (
          isCustomerStateChanged ||
          isCheckoutCompleted ||
          isSubscriptionCreated ||
          isSubscriptionRenewed
        ) {
          console.log("webhook.payment_successful", {
            type: payload.type,
            timestamp: new Date().toISOString(),
          });
          // Extract purchase data from the checkout metadata
          const metadata = checkoutData.metadata || {};
          console.log("webhook.metadata_extraction", {
            hasMetadata: !!metadata,
            metadataKeys: Object.keys(metadata),
            timestamp: new Date().toISOString(),
          });

          const blockSize = metadata.blockSize || "medium";
          let locations = [];
          try {
            locations = JSON.parse(metadata.locations || "[]");
            console.log("webhook.locations_parsed", {
              locationCount: locations.length,
              locations: locations,
              timestamp: new Date().toISOString(),
            });
          } catch (parseError) {
            console.error("webhook.locations_parse_error", {
              error: parseError.message,
              rawLocations: metadata.locations,
              timestamp: new Date().toISOString(),
            });
          }

          const projectName = metadata.projectName || "";
          const developerName = metadata.developerName || "";
          const description = metadata.description || "";
          const websiteUrl = metadata.websiteUrl || "";
          const category = metadata.category || "";

          // Get block dimensions
          const { width, height } = getBlockDimensions(blockSize);

          console.log("Processing locations:", locations);

          // For each location, check for overlaps and then create a project entry in the database
          console.log("webhook.begin_location_processing", {
            locationCount: locations.length,
            timestamp: new Date().toISOString(),
          });

          for (const location of locations) {
            console.log("webhook.processing_location", {
              location: location,
              timestamp: new Date().toISOString(),
            });

            // Check for overlapping projects at this location
            const { data: overlappingProjects, error: overlapError } =
              await supabase
                .from("projects")
                .select("*")
                .or(
                  `and(x,lt.${location.x + width},x+width,gt.${location.x},y,lt.${location.y + height},y+height,gt.${location.y})`,
                );

            if (overlapError) {
              console.error(
                "Error checking for overlapping projects:",
                overlapError,
              );

              // Log the error
              try {
                await supabase.from("webhook_logs").insert({
                  event_type: "overlap_check_error",
                  payload: { location, projectName, developerName, blockSize },
                  error: overlapError.message,
                  status: "error",
                });
              } catch (logError) {
                console.error("Error logging overlap check error:", logError);
              }
            }

            // If overlapping projects found, log them but continue with insertion
            if (overlappingProjects && overlappingProjects.length > 0) {
              console.warn(
                `Found ${overlappingProjects.length} overlapping projects at location (${location.x}, ${location.y})`,
              );

              // Log the overlap warning
              try {
                await supabase.from("webhook_logs").insert({
                  event_type: "project_overlap_warning",
                  payload: {
                    location,
                    projectName,
                    developerName,
                    blockSize,
                    overlappingProjects: overlappingProjects.map((p) => ({
                      id: p.id,
                      project_name: p.project_name,
                      x: p.x,
                      y: p.y,
                      width: p.width,
                      height: p.height,
                    })),
                  },
                  status: "warning",
                });
              } catch (logError) {
                console.error("Error logging overlap warning:", logError);
              }
            }

            // Proceed with insertion
            console.log("webhook.inserting_project", {
              projectName,
              developerName,
              location,
              timestamp: new Date().toISOString(),
            });

            const { data, error } = await supabase.from("projects").insert({
              project_name: projectName,
              developer_name: developerName,
              description: description,
              website_url: websiteUrl,
              x: location.x,
              y: location.y,
              width: width,
              height: height,
              color: getRandomColor(),
              category: category,
            });

            if (error) {
              console.error("Error saving project to database:", error);
              console.log("webhook.project_insert_error", {
                error: error.message,
                code: error.code,
                details: error.details,
                timestamp: new Date().toISOString(),
              });

              // Log the error
              try {
                await supabase.from("webhook_logs").insert({
                  event_type: "project_insert_error",
                  payload: { location, projectName, developerName, blockSize },
                  error: error.message,
                  status: "error",
                });
              } catch (logError) {
                console.error("Error logging webhook error:", logError);
              }

              return new Response(
                JSON.stringify({ error: "Failed to save project" }),
                {
                  headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                  },
                  status: 500,
                },
              );
            }
          }

          // Update the checkout record to mark it as processed
          console.log("webhook.updating_checkout_record", {
            checkoutId,
            timestamp: new Date().toISOString(),
          });

          const { error: updateError } = await supabase
            .from("polar_checkouts")
            .update({ processed: true, processed_at: new Date().toISOString() })
            .eq("checkout_id", checkoutId);

          if (updateError) {
            console.error("Error updating checkout record:", updateError);

            // Log the error
            try {
              await supabase.from("webhook_logs").insert({
                event_type: "checkout_update_error",
                payload: { checkoutId },
                error: updateError.message,
                status: "error",
              });
            } catch (logError) {
              console.error("Error logging webhook error:", logError);
            }
          }

          // Query for total project count and grid statistics
          let projectStats = { count: 0, totalArea: 0 };
          try {
            const { data: statsData, error: statsError } = await supabase
              .from("projects")
              .select("id, width, height");

            if (!statsError && statsData) {
              projectStats.count = statsData.length;
              projectStats.totalArea = statsData.reduce(
                (sum, project) => sum + project.width * project.height,
                0,
              );
            }
          } catch (statsError) {
            console.error("Error fetching project statistics:", statsError);
          }

          // Log successful processing with additional stats
          try {
            await supabase.from("webhook_logs").insert({
              event_type: "payment_processed",
              payload: {
                checkoutId,
                locations: locations.length,
                projectStats: projectStats,
                gridCoverage:
                  projectStats.totalArea > 0
                    ? ((projectStats.totalArea / 1000000) * 100).toFixed(2) +
                      "%"
                    : "0%",
              },
              status: "success",
            });
          } catch (logError) {
            console.error("Error logging webhook success:", logError);
          }

          console.log("webhook.processing_completed_successfully", {
            checkoutId,
            timestamp: new Date().toISOString(),
          });

          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          console.log("webhook.payment_not_successful", {
            type: payload.type,
            state: payload.data.state,
            status: payload.data.status,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Log the webhook event type for debugging
      console.log(`Processed webhook of type: ${payload.type}`);

      // Return a success response for other webhook types
      console.log("webhook.unhandled_event_type", {
        type: payload.type,
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ received: true, eventType: payload.type }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    } catch (error) {
      console.error("Error processing webhook:", error);
      console.log("webhook.unhandled_exception", {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  }

  // Handle unsupported methods
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 405,
  });
});
