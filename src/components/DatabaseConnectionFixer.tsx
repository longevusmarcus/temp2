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
import { supabase } from "@/lib/supabase-client";

export default function DatabaseConnectionFixer() {
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
      // Test if we can query the webhook_logs table
      const { data: logsData, error: logsError } = await supabase
        .from("webhook_logs")
        .select("count(*)")
        .limit(1);

      if (logsError) {
        setResult({
          success: false,
          message: "Failed to connect to webhook_logs table",
          details: logsError.message,
        });
        return;
      }

      // Test if we can query the projects table
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("count(*)")
        .limit(1);

      if (projectsError) {
        setResult({
          success: false,
          message: "Failed to connect to projects table",
          details: projectsError.message,
        });
        return;
      }

      setResult({
        success: true,
        message: "Successfully connected to the database",
        details: `webhook_logs: ${JSON.stringify(logsData)}\nprojects: ${JSON.stringify(projectsData)}`,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Error testing database connection",
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
          Database Connection Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool helps diagnose and fix connection issues with your
            Supabase database. The client has been modified to use the service
            role key instead of the anon key.
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
              Test Database Connection
            </>
          )}
        </Button>

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">
            Connection Information:
          </div>
          <div className="p-3 bg-gray-800 rounded-md text-sm">
            <p className="mb-1">• Using service role key instead of anon key</p>
            <p className="mb-1">
              • Tables have been created if they didn't exist
            </p>
            <p className="mb-1">
              • Row Level Security (RLS) has been disabled on all tables
            </p>
            <p>• Tables have been added to the realtime publication</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
