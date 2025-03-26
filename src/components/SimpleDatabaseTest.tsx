import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function SimpleDatabaseTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const testConnection = async () => {
    setLoading(true);
    setResult("");

    try {
      // Create a direct client with hardcoded credentials
      const supabase = createClient(
        "https://mbqihswchccmvqmjlpwq.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTM0MzY4MDAsImV4cCI6MjAwOTAxMjgwMH0.qmO3KXHzgZZM_pVlnEqjwfXZUlSXYtXfTj7yfzwmHUo",
      );

      // Try a simple query
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .limit(1);

      if (error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult(`Success! Data: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      setResult(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white border-gray-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Simple Database Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This component uses a direct Supabase client with hardcoded
            credentials to test the connection.
          </AlertDescription>
        </Alert>

        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Connection"
          )}
        </Button>

        {result && (
          <div className="p-3 bg-gray-100 rounded-md font-mono text-sm whitespace-pre-wrap">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
