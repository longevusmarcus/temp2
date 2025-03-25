import { createClient } from "@supabase/supabase-js";
import express from "express";
import { Webhooks } from "@polar-sh/sdk/webhooks";
import cors from "cors";
import { handleSuccessfulPayment } from "./webhook-handler";

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
const WEBHOOK_SECRET = "d07e6a6640f441949ad0fb00d6e43e8e";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Log Supabase configuration (without exposing full keys)
console.log("Polar webhook Supabase configuration:", {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : "NOT SET",
  serviceKey: supabaseServiceKey ? "SET (masked)" : "NOT SET",
});

// Initialize Express app
const app = express();

console.log("webhook.server_initialized", {
  timestamp: new Date().toISOString(),
});

// Configure middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "authorization",
      "x-client-info",
      "apikey",
      "content-type",
      "webhook-signature",
    ],
  }),
);

// Initialize Polar webhooks
const webhooks = new Webhooks({
  secret: WEBHOOK_SECRET,
});

// Handle preflight requests
app.options("*", (req, res) => {
  console.log("webhook.options_request_received", {
    path: req.path,
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });
  res.status(200).send("ok");
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

// Main webhook endpoint
app.post("/", async (req, res) => {
  console.log("webhook.handler_called", {
    path: req.path,
    method: req.method,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });
  try {
    // Get the raw payload and signature
    const payload = req.body;
    const signature = req.headers["webhook-signature"] as string;

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
      return res.status(401).json({ error: "Invalid signature" });
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
        headers: req.headers,
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
        return res.status(400).json({ error: "No checkout ID provided" });
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
          return res.status(404).json({
            error: "Checkout not found",
            details: checkoutError,
            webhookType: payload.type,
            checkoutId: checkoutId,
          });
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

            return res.status(500).json({ error: "Failed to save project" });
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
                  ? ((projectStats.totalArea / 1000000) * 100).toFixed(2) + "%"
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

        return res.status(200).json({ success: true });
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

    return res.status(200).json({ received: true, eventType: payload.type });
  } catch (error) {
    console.error("Error processing webhook:", error);
    console.log("webhook.unhandled_exception", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Polar webhook server running on port ${PORT}`);
  console.log("webhook.server_started", {
    port: PORT,
    timestamp: new Date().toISOString(),
    webhookUrl: "/polar-webhook",
    webhookUrlWithSlash: "/polar-webhook/",
  });
});

export default app;
