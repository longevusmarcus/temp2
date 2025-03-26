import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Info, CheckCircle, XCircle, Copy } from "lucide-react";
import { useToast } from "./ui/use-toast";

export default function EnvVarsChecker() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientEnvVars, setClientEnvVars] = useState<Record<string, string>>({});

  // Check client-side environment variables
  const checkClientEnvVars = () => {
    const vars: Record<string, string> = {};
    
    // Check for all relevant environment variables
    const envVarNames = [
      "VITE_SUPABASE_URL",
      "VITE_SUPABASE_ANON_KEY",
      "VITE_SUPABASE_PROJECT_ID",
      "VITE_SUPABASE_SERVICE_KEY",
      "SUPABASE_SERVICE_KEY",
      "SUPABASE_SERVICE_ROLE_KEY"
    ];
    
    for (const name of envVarNames) {
      const value = (import.meta.env as any)[name];
      vars[name] = value ? "Available" : "Not found";
    }
    
    setClientEnvVars(vars);
  };

  const copyEnvInstructions = () => {
    const instructions = `To fix the missing environment variables, go to your project settings in Tempo and add the following environment variables:\n\nVITE_SUPABASE_SERVICE_KEY=your_service_key_here\nSUPABASE_SERVICE_KEY=your_service_key_here\n\nYou can find your service key in the Supabase dashboard under Project Settings > API > Project API keys > service_role key.`;
    
    navigator.clipboard.writeText(instructions);
    toast({
      title: "Copied to clipboard",
      description: "Instructions for fixing environment variables have been copied."
    });
  };

  const testEnvVars = async () => {
    setLoading(true);
    setError(null);
    checkClientEnvVars();
    
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
      if (!projectId) {
        throw new Error("VITE_SUPABASE_PROJECT_ID is not set");
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/env-check`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error testing environment variables:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Environment Variables Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool checks environment variables both client-side and in Supabase Edge Functions.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="font-medium text-sm text-gray-300">Client-Side Environment Variables:</div>
          <div className="p-3 bg-gray-800 rounded-md">
            {Object.keys(clientEnvVars).length > 0 ? (
              <ul className="space-y-1">
                {Object.entries(clientEnvVars).map(([key, value]) => (
                  <li key={key} className="flex items-center">
                    {value === "Available" ? (
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 mr-2" />
                    )}
                    <span className="font-mono text-sm">{key}:</span>
                    <span className={`ml-2 text-sm ${value === "Available" ? "text-green-400" : "text-red-400"}`}>
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">Click the button below to check variables</div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={testEnvVars}
            disabled={loading}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Environment Variables"
            )}
          </Button>
          
          <Button
            onClick={copyEnvInstructions}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Fix Instructions
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-md">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              <div>
                <div className="font-medium text-red-400">Error</div>
                <div className="mt-1 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-900/30 border border-green-800 rounded-md">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
              <div>
                <div className="font-medium text-green-400">{result.message}</div>
                <div className="mt-2 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Environment Variables Count:</span> {result.envVarCount}
                  </div>
                  <div>
                    <span className="font-medium">Variable Names:</span>
                    <div className="mt-1 p-2 bg-gray-800 rounded text-xs font-mono">
                      {result.envVarNames.join(", ")}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Checks:</span>
                    <ul className="mt-1 space-y-1">
                      <li className="flex items-center">
                        {result.checks.hasSupabaseUrl ? (
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mr-2" />
                        )}
                        Supabase URL
                      </li>
                      <li className="flex items-center">
                        {result.checks.hasServiceKey ? (
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mr-2" />
                        )}
                        Service Key
                      </li>
                      <li className="flex items-center">
                        {result.checks.hasAnonKey ? (
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mr-2" />
                        )}
                        Anon Key
                      </li>
                      <li className="flex items-center">
                        {result.checks.hasProjectId ? (
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mr-2" />
                        )}
                        Project ID
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 bg-amber-900/30 border border-amber-800 rounded-md">
          <div className="font-medium text-amber-400 mb-2">How to Fix Missing Environment Variables:</div>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-amber-200">
            <li>Go to your project settings in Tempo</li>
            <li>Add the following environment variables:
              <div className="mt-1 p-2 bg-gray-800 rounded text-xs font-mono">
                VITE_SUPABASE_SERVICE_KEY=your_service_key_here<br/>
                SUPABASE_SERVICE_KEY=your_service_key_here
              </div>
            </li>
            <li>You can find your service key in the Supabase dashboard under Project Settings > API > Project API keys > service_role key</li>
            <li>After adding the variables, redeploy your functions</li>
          </ol>
        </div>

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">Troubleshooting:</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
            <li>Environment variables set in Tempo should be available to Edge Functions</li>
            <li>Edge Functions use regular environment variables (not VITE_ prefixed)</li>
            <li>The deployment process should pass environment variables to the function</li>
            <li>If variables are missing, try redeploying the function</li>
            <li>Check if your Supabase project ID is correct</li>
            <li>Verify that your service key has the correct permissions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
