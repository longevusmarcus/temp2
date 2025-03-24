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

// Function to get the Supabase client instance
export const getSupabase = () => {
  // Check global instance first
  if (globalThis.supabaseClientInstance)
    return globalThis.supabaseClientInstance;

  // Use environment variables for the Supabase URL and anon key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  // Log environment variable status for debugging
  console.log("Environment variables check:", {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseKey: !!supabaseKey,
    urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + "..." : "undefined",
    keyPrefix: supabaseKey ? supabaseKey.substring(0, 5) + "..." : "undefined",
    isValidUrl: supabaseUrl ? isValidUrl(supabaseUrl) : false,
  });

  // Check if URL is valid
  const urlIsValid = supabaseUrl && isValidUrl(supabaseUrl);

  // For debugging purposes
  if (!urlIsValid || !supabaseKey) {
    console.warn(
      `Supabase credentials issue: ${!urlIsValid ? "Invalid URL" : "Missing key"}. Database operations will fail.`,
    );
    // Return a dummy client that won't throw errors immediately
    // This allows the app to at least render without crashing
    const dummyUrl = "https://example.com";
    const dummyKey = "dummy-key";
    globalThis.supabaseClientInstance = createClient<Database>(
      dummyUrl,
      dummyKey,
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
    // Return a dummy client as fallback
    const dummyUrl = "https://example.com";
    const dummyKey = "dummy-key";
    globalThis.supabaseClientInstance = createClient<Database>(
      dummyUrl,
      dummyKey,
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

// For backward compatibility with existing code
export const supabase = getSupabase();
