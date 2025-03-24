import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

const TestConnectionStoryboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Display environment variables (masked)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
  const supabaseServiceKey = import.meta.env
    .VITE_SUPABASE_SERVICE_KEY as string;

  const maskString = (str: string) => {
    if (!str) return "Not set";
    return str.length > 10
      ? `${str.substring(0, 5)}...${str.substring(str.length - 5)}`
      : "Set but too short";
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Check if environment variables are set
      if (!supabaseUrl || !supabaseAnonKey) {
        setResult({
          success: false,
          message: "Supabase URL or Anon Key is missing",
          details: {
            supabaseUrl: supabaseUrl ? "Set" : "Not set",
            supabaseAnonKey: supabaseAnonKey ? "Set" : "Not set",
            supabaseProjectId: supabaseProjectId ? "Set" : "Not set",
            supabaseServiceKey: supabaseServiceKey ? "Set" : "Not set",
            envPrefix: "Using VITE_ prefixed variables",
          },
        });
        return;
      }

      // Test basic connection
      const { data, error } = await supabase
        .from("projects")
        .select("count(*)", { count: "exact", head: true });

      if (error) {
        setResult({
          success: false,
          message: `Database connection error: ${error.message}`,
          details: {
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        });
        return;
      }

      // Try to get a sample row
      const { data: sampleData, error: sampleError } = await supabase
        .from("projects")
        .select("*")
        .limit(1);

      setResult({
        success: true,
        message: "Successfully connected to Supabase",
        details: {
          count:
            data && typeof data === "object" && "count" in data
              ? data.count
              : 0,
          sampleData: sampleData || [],
          hasSampleData: sampleData && sampleData.length > 0,
        },
      });
    } catch (err) {
      setResult({
        success: false,
        message: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-purple-400">
            Supabase Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            <p>Test your Supabase connection to diagnose database issues.</p>
          </div>

          <div className="space-y-2 text-xs text-gray-400">
            <p>
              <span className="font-medium">Supabase URL:</span>{" "}
              {maskString(supabaseUrl)}
            </p>
            <p>
              <span className="font-medium">Anon Key:</span>{" "}
              {maskString(supabaseAnonKey)}
            </p>
            <p>
              <span className="font-medium">Project ID:</span>{" "}
              {maskString(supabaseProjectId)}
            </p>
            <p>
              <span className="font-medium">Service Key:</span>{" "}
              {maskString(supabaseServiceKey)}
            </p>
          </div>

          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span>Test Connection</span>
            )}
          </Button>

          {result && (
            <Alert
              className={`mt-4 ${result.success ? "bg-green-900/30 border-green-800" : "bg-red-900/30 border-red-800"}`}
            >
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
                )}
                <div>
                  <AlertTitle
                    className={
                      result.success ? "text-green-400" : "text-red-400"
                    }
                  >
                    {result.success
                      ? "Connection Successful"
                      : "Connection Failed"}
                  </AlertTitle>
                  <AlertDescription className="text-sm mt-1">
                    {result.message}

                    {result.details && (
                      <div className="mt-2 text-xs overflow-auto max-h-40 bg-gray-800/50 p-2 rounded">
                        <pre>{JSON.stringify(result.details, null, 2)}</pre>
                      </div>
                    )}

                    {!result.success && (
                      <div className="mt-2 text-xs">
                        <p className="font-medium">Troubleshooting steps:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>
                            Verify your Supabase URL and Anon Key are correct
                          </li>
                          <li>Check if migrations have been run</li>
                          <li>
                            Ensure Row Level Security (RLS) policies are
                            configured correctly
                          </li>
                          <li>
                            Try deploying the test webhook to verify the
                            connection
                          </li>
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestConnectionStoryboard;
