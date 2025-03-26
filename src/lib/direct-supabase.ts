import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Create a direct client with service role key for more permissions
const supabase = createClient<Database>(
  "https://mbqihswchccmvqmjlpwq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQzNjgwMCwiZXhwIjoyMDA5MDEyODAwfQ.Ow-_JWmWlNm8gVMdPVoLbXNUoaUxKtU_cOIp-cNVxDM",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

console.log("Direct Supabase client initialized with service role key");

export { supabase };
