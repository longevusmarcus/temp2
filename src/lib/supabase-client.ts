import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Singleton pattern to ensure only one Supabase client instance exists
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

// Function to get the Supabase client instance
export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  // Use environment variables for the Supabase URL and anon key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  // For debugging purposes
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase credentials missing. Database operations will fail.",
    );
  }

  // Create a single instance of the Supabase client to be used throughout the app
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseInstance;
};

// For backward compatibility with existing code
export const supabase = getSupabase();
