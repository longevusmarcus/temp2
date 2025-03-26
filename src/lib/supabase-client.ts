import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Use a global variable to ensure singleton pattern works across modules
declare global {
  var supabaseClientInstance:
    | ReturnType<typeof createClient<Database>>
    | undefined;
}

// Function to validate URL format
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
};

// Hardcoded service key for fallback when environment variables fail
const HARDCODED_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQzNjgwMCwiZXhwIjoyMDA5MDEyODAwfQ.Ow-_JWmWlNm8gVMdPVoLbXNUoaUxKtU_cOIp-cNVxDM";

// Function to get the Supabase client instance
export const getSupabase = () => {
  // Check global instance first

  // Use environment variables for the Supabase URL and anon key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  // Always use the hardcoded service key to ensure consistent connection
  const supabaseKey = HARDCODED_SERVICE_KEY;

  // Log environment variable status for debugging
  console.log("Initializing Supabase singleton client with service key:", {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "undefined",
    keyPrefix: supabaseKey ? supabaseKey.substring(0, 5) + "..." : "undefined",
    isValidUrl: supabaseUrl ? isValidUrl(supabaseUrl) : false,
    fullUrl: supabaseUrl || "not set",
    usingHardcodedKey: supabaseKey === HARDCODED_SERVICE_KEY,
  });

  // Check if URL is valid
  const urlIsValid = supabaseUrl && isValidUrl(supabaseUrl);

  // For debugging purposes
  if (!urlIsValid) {
    console.warn(
      `Supabase URL issue: ${!urlIsValid ? "Invalid URL" : "Missing URL"}. Using fallback URL.`,
    );
    // Use a fallback URL if the provided one is invalid
    const fallbackUrl = "https://mbqihswchccmvqmjlpwq.supabase.co";
    globalThis.supabaseClientInstance = createClient<Database>(
      fallbackUrl,
      supabaseKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      },
    );
    return globalThis.supabaseClientInstance;
  }

  // Create a single instance of the Supabase client to be used throughout the app
  try {
    console.log(
      "Creating new Supabase client instance with service key (singleton)...",
    );
    globalThis.supabaseClientInstance = createClient<Database>(
      supabaseUrl,
      supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      },
    );
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    // Return a client with fallback values
    const fallbackUrl = "https://mbqihswchccmvqmjlpwq.supabase.co";
    globalThis.supabaseClientInstance = createClient<Database>(
      fallbackUrl,
      HARDCODED_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      },
    );
  }

  return globalThis.supabaseClientInstance;
};

// Create a single instance to be used throughout the application
// This ensures we only have one GoTrueClient instance
export const supabase = getSupabase();
console.log(
  "Supabase singleton client initialized and exported with service key",
);
