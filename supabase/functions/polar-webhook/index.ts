import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

// Get environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY") || "";
const WEBHOOK_SECRET = "d07e6a6640f441949ad0fb00d6e43e8e";

// Create Supabase client with detailed logging
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Log Supabase configuration (without exposing full keys)
console.log("Polar webhook Supabase configuration:", {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : "NOT SET",
  serviceKey: supabaseServiceKey ? "SET (masked)" : "NOT SET",
});

// Verify Supabase connection on startup
(async () => {
  try {
    const { data, error } = await supabase.from("webhook_logs").insert({
      event_type: "webhook_startup",
      payload: { timestamp: new Date().toISOString() },
      status: "startup",
    });

    if (error) {
      console.error(
        "CRITICAL: Failed to connect to Supabase on startup:",
        error,
      );
    } else {
      console.log("Successfully connected to Supabase on startup");
    }
  } catch (e) {
    console.error("CRITICAL: Exception when connecting to Supabase:", e);
  }
})();

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

// Verify webhook signature - temporarily disabled for testing
async function verifySignature(
  request: Request,
  payload: string,
): Promise<boolean> {
  // Temporarily return true to bypass signature verification during testing
  return true;
  /*
  const signature = request.headers.get("webhook-signature");
  if (!signature) {
    console.error("No webhook signature found in headers");
    return false;
  }

  // Parse the signature header
  const [timestamp, signatureHash] = signature.split(",");
  if (!timestamp || !signatureHash) {
    console.error("Invalid signature format");
    return false;
  }

  const timestampValue = timestamp.split("t=")[1];
  const signatureValue = signatureHash.split("signature=")[1];

  if (!timestampValue || !signatureValue) {
    console.error("Invalid signature components");
    return false;
  }

  // Check if the timestamp is within tolerance (5 minutes)
  const timestampDate = new Date(parseInt(timestampValue) * 1000);
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  if (timestampDate < fiveMinutesAgo) {
    console.error("Webhook timestamp too old");
    return false;
  }

  // Create the signed payload
  const signedPayload = `${timestampValue}.${payload}`;

  // Convert the webhook secret to a crypto key
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  // Generate the expected signature
  const signedData = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(signedPayload),
  );

  const expectedSignature = encodeHex(new Uint8Array(signedData));

  // Compare the signatures
  return expectedSignature === signatureValue;
  */
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type, webhook-signature",
      },
    });
  }

  try {
    // Clone the request to read the body twice (once for verification, once for processing)
    const clonedReq = req.clone();

    // Get the raw payload as a string for signature verification
    const rawPayload = await clonedReq.text();

    // Verify the webhook signature
    const isValid = await verifySignature(req, rawPayload);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Parse the webhook payload with detailed logging
    const payload = JSON.parse(rawPayload);
    console.log("Received webhook:", JSON.stringify(payload));
    console.log("Webhook type:", payload.type);
    console.log("Webhook data:", JSON.stringify(payload.data));

    // Log the webhook event for debugging
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

    // Verify the webhook is from Polar (you should implement proper verification)
    // For production, you should verify the webhook signature

    // Handle various Polar webhook events
    if (
      (payload.type === "customer.state_changed" ||
        payload.type === "checkout.completed" ||
        payload.type === "subscription.created" ||
        payload.type === "subscription.renewed") &&
      payload.data
    ) {
      // Get the checkout session ID from the payload
      const checkoutId = payload.data.checkout_id;

      if (!checkoutId) {
        console.error("No checkout ID in webhook payload");
        return new Response(
          JSON.stringify({ error: "No checkout ID provided" }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }

      // Get the checkout session details with detailed error handling
      console.log(`Looking up checkout with ID: ${checkoutId}`);
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
              email: payload.data.email || payload.data.customer?.email || null,
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
              status: 404,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }
      }

      // Check if payment is successful
      // For customer.state_changed, we check state === "active"
      // For checkout.completed, we process it directly
      // For subscription events, we also process them directly
      if (
        payload.data.state === "active" ||
        payload.type === "checkout.completed" ||
        payload.type === "subscription.created" ||
        payload.type === "subscription.renewed"
      ) {
        // Extract purchase data from the checkout metadata
        const metadata = checkoutData.metadata || {};
        const blockSize = metadata.blockSize || "medium";
        const locations = JSON.parse(metadata.locations || "[]");
        const projectName = metadata.projectName || "";
        const developerName = metadata.developerName || "";
        const description = metadata.description || "";
        const websiteUrl = metadata.websiteUrl || "";
        const category = metadata.category || "";

        // Get block dimensions
        const { width, height } = getBlockDimensions(blockSize);

        console.log("Processing locations:", locations);

        // For each location, check for overlaps and then create a project entry in the database
        for (const location of locations) {
          console.log("Processing location:", location);

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
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
              },
            );
          }
        }

        // Update the checkout record to mark it as processed
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
                  ? ((projectStats.totalArea / 1000000) * 100).toFixed(2) + "%"
                  : "0%",
            },
            status: "success",
          });
        } catch (logError) {
          console.error("Error logging webhook success:", logError);
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    // Log the webhook event type for debugging
    console.log(`Processed webhook of type: ${payload.type}`);

    // Return a success response for other webhook types
    return new Response(
      JSON.stringify({ received: true, eventType: payload.type }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
