import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Use service role key instead of anon key for more permissions
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://mbqihswchccmvqmjlpwq.supabase.co";

// Try different environment variables for the service key
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_SERVICE_KEY || // Try this first
  import.meta.env.SUPABASE_SERVICE_KEY || // Then this
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || // Then this
  // Fallback to hardcoded service role key
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQzNjgwMCwiZXhwIjoyMDA5MDEyODAwfQ.Ow-_JWmWlNm8gVMdPVoLbXNUoaUxKtU_cOIp-cNVxDM";

// Create a direct client with proper options
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

console.log("Created Supabase client with service role key");
console.log(`Using URL: ${SUPABASE_URL}`);
console.log(`Using key starting with: ${SUPABASE_KEY.substring(0, 10)}...`);
