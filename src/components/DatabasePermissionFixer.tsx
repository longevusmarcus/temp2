import { useState } from "react";
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
import { supabase } from "@/lib/supabase-client-fixed";

export default function DatabasePermissionFixer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const fixPermissions = async () => {
    setLoading(true);
    setResult(null);

    try {
      console.log(
        "DatabasePermissionFixer using direct supabase client with service role key",
      );

      // Test if we can query the webhook_logs table
      const { data: logsData, error: logsError } = await supabase
        .from("webhook_logs")
        .select("*")
        .limit(1);

      // Test if we can query the projects table
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .limit(1);

      // Try the test_api_key function
      const { data: apiKeyData, error: apiKeyError } =
        await supabase.rpc("test_api_key");

      // Collect all errors
      const errors = [];
      if (logsError) errors.push(`Webhook logs: ${logsError.message}`);
      if (projectsError) errors.push(`Projects: ${projectsError.message}`);
      if (apiKeyError) errors.push(`API Key test: ${apiKeyError.message}`);

      if (errors.length > 0) {
        setResult({
          success: false,
          message: "Still having permission issues with some tables",
          details: errors.join("\n"),
        });
      } else {
        setResult({
          success: true,
          message: "Successfully accessed all tables and functions",
          details: `Webhook logs: ${logsData?.length ?? 0} rows\nProjects: ${projectsData?.length ?? 0} rows\nAPI Key test: ${apiKeyData}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error testing database permissions",
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
          Database Permission Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool tests if your database permissions have been fixed. The
            SQL migration has been run to create tables and grant proper
            permissions.
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
          onClick={fixPermissions}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Permissions...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Test Database Permissions
            </>
          )}
        </Button>

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">
            Database Information:
          </div>
          <div className="p-3 bg-gray-800 rounded-md text-sm">
            <p className="mb-1">• Using direct connection with anon key</p>
            <p className="mb-1">
              • Tables have been created with proper structure
            </p>
            <p className="mb-1">
              • Row Level Security (RLS) has been disabled on all tables
            </p>
            <p className="mb-1">
              • Permissions have been granted to anon, authenticated, and
              service_role
            </p>
            <p>• Tables have been added to the realtime publication</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
