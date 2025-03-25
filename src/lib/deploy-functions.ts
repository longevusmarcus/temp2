import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string;
const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;

// Log environment variables (masked for security)
console.log("Deploy Functions Environment Variables:", {
  supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 8)}...` : "not set",
  supabaseServiceKey: supabaseServiceKey ? "set (masked)" : "not set",
  supabaseProjectId: supabaseProjectId
    ? `${supabaseProjectId.substring(0, 5)}...`
    : "not set",
});

// Create Supabase client - only create if both URL and key are available
const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

/**
 * Deploy a Supabase Edge Function using the Management API
 * @param functionName The name of the function to deploy
 * @param functionCode The TypeScript code of the function
 * @returns Promise with the deployment result
 */
export async function deployEdgeFunction(
  functionName: string,
  functionCode: string,
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log(`Deploying edge function: ${functionName}`);

    if (!supabaseProjectId) {
      return {
        success: false,
        message: "VITE_SUPABASE_PROJECT_ID environment variable is not set",
      };
    }

    if (!supabaseServiceKey) {
      return {
        success: false,
        message: "VITE_SUPABASE_SERVICE_KEY environment variable is not set",
      };
    }

    // Extract just the token part from the service key
    const serviceKeyToken = supabaseServiceKey.split(".")[1];
    if (!serviceKeyToken) {
      return {
        success: false,
        message: "Invalid SUPABASE_SERVICE_KEY format",
      };
    }

    // Create the function via Supabase Management API
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${supabaseProjectId}/functions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseServiceKey}`,
          "X-Client-Info": "Tempo Web App",
        },
        body: JSON.stringify({
          name: functionName,
          verify_jwt: false,
          import_map: {},
          entrypoint_path: "index.ts",
          content: btoa(functionCode), // Base64 encode the function code
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Function deployment failed:", data);
      return {
        success: false,
        message: `Deployment failed: ${data.message || response.statusText}`,
        data,
      };
    }

    console.log("Function deployed successfully:", data);
    return {
      success: true,
      message: "Function deployed successfully",
      data,
    };
  } catch (error) {
    console.error("Error deploying function:", error);
    return {
      success: false,
      message: `Error deploying function: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Get the code of a function from a file path
 * @param filePath Path to the function file
 * @returns The function code as a string
 */
export async function getFunctionCode(
  filePath: string,
): Promise<string | null> {
  try {
    // Use a more reliable approach to fetch the file
    // Add a cache-busting query parameter
    const timestamp = new Date().getTime();
    const response = await fetch(`${filePath}?t=${timestamp}`, {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch function code from ${filePath}. Status: ${response.status}`,
      );
      return null;
    }

    const text = await response.text();
    console.log(`Successfully fetched function code (${text.length} bytes)`);
    return text;
  } catch (error) {
    console.error(`Error fetching function code from ${filePath}:`, error);
    return null;
  }
}

/**
 * Deploy a test webhook function to verify Supabase connection
 */
export async function deployTestWebhook(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get the function code
    const functionCode = await getFunctionCode(
      "./supabase/functions/test-webhook/index.ts",
    );
    if (!functionCode) {
      return {
        success: false,
        message: "Failed to get test-webhook function code",
      };
    }

    // Deploy the function
    const result = await deployEdgeFunction("test-webhook", functionCode);
    return result;
  } catch (error) {
    console.error("Error deploying test webhook:", error);
    return {
      success: false,
      message: `Error deploying test webhook: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Deploy the Polar webhook function
 */
export async function deployPolarWebhook(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(
      "Starting polar-webhook deployment with Express.js implementation...",
    );

    // Get the Supabase project ID and service key from environment variables
    const supabaseProjectId = import.meta.env
      .VITE_SUPABASE_PROJECT_ID as string;
    const supabaseServiceKey = import.meta.env
      .VITE_SUPABASE_SERVICE_KEY as string;

    // Validate required environment variables
    if (!supabaseProjectId) {
      return {
        success: false,
        message: "VITE_SUPABASE_PROJECT_ID environment variable is not set",
      };
    }

    if (!supabaseServiceKey) {
      return {
        success: false,
        message: "VITE_SUPABASE_SERVICE_KEY environment variable is not set",
      };
    }

    // Get the function code from the file
    const functionCode = await getFunctionCode(
      "./supabase/functions/polar-webhook/index.ts",
    );
    if (!functionCode) {
      return {
        success: false,
        message: "Failed to get polar-webhook function code",
      };
    }

    console.log(
      `Using Express.js polar-webhook code (${functionCode.length} bytes)`,
    );

    console.log(
      `Deploying to project ID: ${supabaseProjectId.substring(0, 5)}...`,
    );

    // Deploy the function
    const result = await deployEdgeFunction("polar-webhook", functionCode);

    // Also deploy the webhook handler
    const handlerCode = await getFunctionCode(
      "./supabase/functions/polar-webhook/webhook-handler.ts",
    );
    if (handlerCode) {
      await deployEdgeFunction("polar-webhook-handler", handlerCode);
    }

    return result;
  } catch (error) {
    console.error("Error deploying polar webhook:", error);

    // Provide more specific error messages based on error type
    if (
      error instanceof TypeError &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("Network error"))
    ) {
      return {
        success: false,
        message: `Network error: Unable to connect to Supabase API. This could be due to network connectivity issues, firewall settings, or the Supabase API being temporarily unavailable.`,
      };
    } else if (error instanceof DOMException && error.name === "AbortError") {
      return {
        success: false,
        message:
          "Request timed out after multiple attempts. The Supabase API took too long to respond. This could be due to high latency or Supabase service issues. Try increasing the timeout or try again later.",
      };
    } else {
      return {
        success: false,
        message: `Error deploying polar webhook: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}
