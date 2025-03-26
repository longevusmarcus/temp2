import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Direct hardcoded credentials for testing
const SUPABASE_URL = "https://mbqihswchccmvqmjlpwq.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM0MzY4MDAsImV4cCI6MjAwOTAxMjgwMH0.qmO3KXHzgZZM_pVlnEqjwfXZUlSXYtXfTj7yfzwmHUo";

// Create a direct client without any fancy logic
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

console.log("Created simple Supabase client with hardcoded credentials");
