import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info, AlertCircle, CheckCircle, Loader2, Key } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function SupabaseKeyTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testKeys = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Hardcoded values for testing
      const supabaseUrl = "https://mbqihswchccmvqmjlpwq.supabase.co";
      const anonKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM0MzY4MDAsImV4cCI6MjAwOTAxMjgwMH0.qmO3KXHzgZZM_pVlnEqjwfXZUlSXYtXfTj7yfzwmHUo";
      const serviceKey =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQzNjgwMCwiZXhwIjoyMDA5MDEyODAwfQ.Ow-_JWmWlNm8gVMdPVoLbXNUoaUxKtU_cOIp-cNVxDM";

      // Test with anon key
      const anonClient = createClient(supabaseUrl, anonKey);
      const { data: anonData, error: anonError } = await anonClient
        .from("webhook_logs")
        .select("count(*)")
        .limit(1);

      // Test with service key
      const serviceClient = createClient(supabaseUrl, serviceKey);
      const { data: serviceData, error: serviceError } = await serviceClient
        .from("webhook_logs")
        .select("count(*)")
        .limit(1);

      setResult({
        success: !anonError || !serviceError,
        message: "Key testing completed",
        details: `Anon Key: ${anonError ? "❌ " + anonError.message : "✅ Working"}
\nService Key: ${serviceError ? "❌ " + serviceError.message : "✅ Working"}
\nAnon Data: ${JSON.stringify(anonData)}
\nService Data: ${JSON.stringify(serviceData)}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Error testing keys",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Supabase Key Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool tests both the anon key and service key to determine which
            one works with your Supabase project.
          </AlertDescription>
        </Alert>

        {result && (
          <Alert
            className={`${result.success ? "bg-green-900/30 border-green-800" : "bg-red-900/30 border-red-800"}`}
          >
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              )}
              <div>
                <AlertTitle
                  className={result.success ? "text-green-400" : "text-red-400"}
                >
                  {result.success ? "Success" : "Error"}
                </AlertTitle>
                <AlertDescription className="text-sm">
                  {result.message}
                  {result.details && (
                    <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap">
                      {result.details}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <Button
          onClick={testKeys}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Keys...
            </>
          ) : (
            <>
              <Key className="mr-2 h-4 w-4" />
              Test Supabase Keys
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
