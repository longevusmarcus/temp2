// Simple script to deploy the webhook using the Supabase Management API
const fs = require("fs");
const https = require("https");

// Get environment variables
const projectId = process.env.VITE_SUPABASE_PROJECT_ID;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!projectId || !serviceKey) {
  console.error(
    "Missing required environment variables: VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_SERVICE_KEY",
  );
  process.exit(1);
}

// Read the webhook code
const webhookCode = fs.readFileSync(
  "./supabase/functions/polar-webhook/index.ts",
  "utf8",
);

// Prepare the request data
const data = JSON.stringify({
  name: "polar-webhook",
  verify_jwt: false,
  import_map: {},
  entrypoint_path: "index.ts",
  content: Buffer.from(webhookCode).toString("base64"),
  env_vars: {
    SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.VITE_SUPABASE_SERVICE_KEY,
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_SERVICE_KEY: process.env.VITE_SUPABASE_SERVICE_KEY,
  },
});

// Prepare the request options
const options = {
  hostname: "api.supabase.com",
  port: 443,
  path: `/v1/projects/${projectId}/functions`,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceKey}`,
    "Content-Length": data.length,
  },
};

// Make the request
console.log("Deploying polar-webhook to Supabase...");
const req = https.request(options, (res) => {
  let responseData = "";

  res.on("data", (chunk) => {
    responseData += chunk;
  });

  res.on("end", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log("Deployment successful!");
      console.log(
        `Webhook URL: https://${projectId}.supabase.co/functions/v1/polar-webhook`,
      );
    } else {
      console.error(`Deployment failed with status code: ${res.statusCode}`);
      try {
        const parsedResponse = JSON.parse(responseData);
        console.error("Error details:", parsedResponse);
      } catch (e) {
        console.error("Response:", responseData);
      }
    }
  });
});

req.on("error", (error) => {
  console.error("Error deploying webhook:", error.message);
});

req.write(data);
req.end();
