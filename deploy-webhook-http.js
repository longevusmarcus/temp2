// Script to deploy Supabase Edge Function using HTTP requests
const fs = require("fs");
const path = require("path");
const https = require("https");

// Get environment variables with more detailed logging
const SUPABASE_PROJECT_ID =
  process.env.SUPABASE_PROJECT_ID || process.env.VITE_SUPABASE_PROJECT_ID;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log("Environment variables check:");
console.log(
  `- SUPABASE_PROJECT_ID: ${SUPABASE_PROJECT_ID ? "Set" : "Not set"}`,
);
console.log(`- SERVICE_ROLE_KEY: ${SERVICE_ROLE_KEY ? "Set" : "Not set"}`);

if (!SUPABASE_PROJECT_ID) {
  console.error("Error: SUPABASE_PROJECT_ID environment variable is not set");
  console.error(
    "Available environment variables:",
    Object.keys(process.env).filter(
      (key) => key.includes("SUPABASE") || key.includes("VITE_SUPABASE"),
    ),
  );
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error(
    "Error: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY environment variable is not set",
  );
  console.error(
    "Available environment variables:",
    Object.keys(process.env).filter(
      (key) => key.includes("SUPABASE") || key.includes("VITE_SUPABASE"),
    ),
  );
  process.exit(1);
}

// Function to read the webhook code
function readWebhookCode() {
  try {
    const filePath = path.join(
      __dirname,
      "supabase",
      "functions",
      "polar-webhook",
      "index.ts",
    );
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error("Error reading webhook code:", error);
    process.exit(1);
  }
}

// Function to deploy the webhook
async function deployWebhook() {
  const webhookCode = readWebhookCode();
  console.log(`Webhook code loaded: ${webhookCode.length} characters`);

  const options = {
    hostname: "api.supabase.com",
    path: `/v1/projects/${SUPABASE_PROJECT_ID}/functions/polar-webhook`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  };

  console.log(`Deploying to: https://${options.hostname}${options.path}`);

  const requestData = JSON.stringify({
    name: "polar-webhook",
    verify_jwt: false,
    body: webhookCode,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Response status code: ${res.statusCode}`);
        console.log(`Response headers: ${JSON.stringify(res.headers)}`);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("Webhook deployed successfully!");
          console.log(data);
          resolve(data);
        } else {
          console.error(
            `Deployment failed with status code: ${res.statusCode}`,
          );
          console.error(data);
          reject(new Error(`Deployment failed: ${data}`));
        }
      });
    });

    req.on("error", (error) => {
      console.error("Error deploying webhook:", error);
      reject(error);
    });

    console.log("Sending request...");
    req.write(requestData);
    req.end();
  });
}

// Execute the deployment
deployWebhook().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
