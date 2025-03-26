import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  Database,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export default function SupabaseConnectionFixer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [envVars, setEnvVars] = useState<Record<string, boolean>>({
    VITE_SUPABASE_URL: false,
    VITE_SUPABASE_ANON_KEY: false,
    VITE_SUPABASE_PROJECT_ID: false,
    VITE_SUPABASE_SERVICE_KEY: false,
    SUPABASE_SERVICE_KEY: false,
    SUPABASE_SERVICE_ROLE_KEY: false,
  });

  useEffect(() => {
    // Check which environment variables are available
    const vars: Record<string, boolean> = {};
    Object.keys(envVars).forEach((key) => {
      vars[key] = !!(import.meta.env as any)[key];
    });
    setEnvVars(vars);
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Test if we can insert data
      const testId = `test-${Date.now()}`;
      const { data: insertData, error: insertError } = await supabase
        .from("webhook_logs")
        .insert({
          id: testId,
          event_type: "connection_test",
          payload: { test: true, timestamp: new Date().toISOString() },
          status: "test",
        })
        .select();

      if (insertError) {
        throw new Error(`Insert test failed: ${insertError.message}`);
      }

      // Test if we can update data
      const { error: updateError } = await supabase
        .from("webhook_logs")
        .update({ status: "test_updated" })
        .eq("id", testId);

      if (updateError) {
        throw new Error(`Update test failed: ${updateError.message}`);
      }

      // Test if we can delete data
      const { error: deleteError } = await supabase
        .from("webhook_logs")
        .delete()
        .eq("id", testId);

      if (deleteError) {
        throw new Error(`Delete test failed: ${deleteError.message}`);
      }

      setResult({
        success: true,
        message: "All database operations successful",
        details:
          "Insert, update, and delete operations completed successfully.",
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Database operations failed",
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
          Supabase Connection Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool tests if your Supabase connection can perform write
            operations (insert, update, delete). If Tempo is not saving changes,
            this might help identify the issue.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="font-medium text-sm text-gray-300">
            Environment Variables Status:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(envVars).map(([key, available]) => (
              <div key={key} className="flex items-center">
                {available ? (
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                )}
                <span className="text-sm font-mono">{key}:</span>
                <span
                  className={`ml-2 text-sm ${available ? "text-green-400" : "text-red-400"}`}
                >
                  {available ? "Available" : "Not found"}
                </span>
              </div>
            ))}
          </div>
        </div>

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
                <div className="font-medium">{result.message}</div>
                {result.details && (
                  <div className="mt-2 p-2 bg-gray-800 rounded text-sm font-mono whitespace-pre-wrap">
                    {result.details}
                  </div>
                )}
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
              Test Database Write Operations
            </>
          )}
        </Button>

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">
            Troubleshooting Tips:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
            <li>
              Make sure SUPABASE_SERVICE_KEY or VITE_SUPABASE_SERVICE_KEY is set
              in your environment variables
            </li>
            <li>
              Check if Row Level Security (RLS) policies are properly configured
            </li>
            <li>
              Verify that your service role key has the necessary permissions
            </li>
            <li>
              Try restarting the application after updating environment
              variables
            </li>
            <li>Check the browser console for any specific error messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
