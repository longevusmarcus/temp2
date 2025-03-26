import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  Database,
  Key,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";

export default function CombinedConnectionTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log("Testing connection with supabase client...");

      // Test with the client
      const { data: testData, error: testError } = await supabase
        .from("webhook_logs")
        .select("count(*)")
        .limit(1);

      console.log("webhook_logs test result:", {
        data: testData,
        error: testError,
      });

      // Try a simple query to check if the projects table exists
      const { data: tableData, error: tableError } = await supabase
        .from("projects")
        .select("count(*)")
        .limit(1);

      console.log("projects test result:", {
        data: tableData,
        error: tableError,
      });

      // Try the test_api_key function
      const { data: apiKeyData, error: apiKeyError } =
        await supabase.rpc("test_api_key");

      console.log("test_api_key result:", {
        data: apiKeyData,
        error: apiKeyError,
      });

      // Try a simple query with a different approach
      const { data: directData, error: directError } = await supabase
        .from("webhook_logs")
        .select("*")
        .limit(1);

      console.log("direct query result:", {
        data: directData,
        error: directError,
      });

      setResult({
        success: !testError || !tableError || !directError,
        message: "Connection testing completed",
        details: `Webhook Logs Test: ${testError ? "❌ " + testError.message : "✅ Working"}\n\nProjects Table: ${tableError ? "❌ " + tableError.message : "✅ Working"}\n\nAPI Key Test: ${apiKeyError ? "❌ " + apiKeyError.message : "✅ Working"}\n\nDirect Query: ${directError ? "❌ " + directError.message : "✅ Working"}\n\nTest Data: ${JSON.stringify(testData)}\n\nTable Data: ${JSON.stringify(tableData)}\n\nAPI Key Data: ${JSON.stringify(apiKeyData)}\n\nDirect Data: ${JSON.stringify(directData)}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Error testing connection",
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
          Supabase Connection Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool tests your Supabase connection using a simplified client
            approach. It checks both the webhook_logs and projects tables.
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
          onClick={testConnection}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Test Supabase Connection
            </>
          )}
        </Button>

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">
            Troubleshooting Tips:
          </div>
          <div className="p-3 bg-gray-800 rounded-md text-sm">
            <p className="mb-1">• Make sure your Supabase project is active</p>
            <p className="mb-1">
              • Check if your API keys have been rotated recently
            </p>
            <p className="mb-1">
              • Verify that the webhook_logs table exists and has proper
              permissions
            </p>
            <p>• Try restarting your development server</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
