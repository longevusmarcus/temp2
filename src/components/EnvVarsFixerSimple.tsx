import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function EnvVarsFixerSimple() {
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

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Environment Variables Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool helps fix missing environment variables that are causing
            Supabase connection issues.
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

        <Alert className="bg-amber-900/30 border-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 mr-2" />
          <AlertTitle className="text-amber-300">
            Missing Service Key
          </AlertTitle>
          <AlertDescription className="text-sm">
            <p className="mb-2">
              The service key is missing from your environment variables. This
              is needed for database operations.
            </p>
            <p className="mb-2">
              Even though the key exists in your .env file, it's not being
              properly loaded into the environment.
            </p>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="p-3 bg-gray-800 rounded-md">
            <div className="font-medium text-sm mb-2">Service Keys to Add:</div>
            <div className="font-mono text-xs whitespace-pre-wrap break-all">
              VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQzNjgwMCwiZXhwIjoyMDA5MDEyODAwfQ.Ow-_JWmWlNm8gVMdPVoLbXNUoaUxKtU_cOIp-cNVxDM
            </div>
            <div className="font-mono text-xs whitespace-pre-wrap break-all mt-2">
              SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5MzQzNjgwMCwiZXhwIjoyMDA5MDEyODAwfQ.Ow-_JWmWlNm8gVMdPVoLbXNUoaUxKtU_cOIp-cNVxDM
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button
              onClick={reloadPage}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Reload Page After Adding Keys
            </Button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">Steps to Fix:</div>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-400">
            <li>Copy the service keys shown above</li>
            <li>Go to your project settings on the Tempo home page</li>
            <li>Add the environment variables as shown above</li>
            <li>Click "Save" in the project settings</li>
            <li>Return to this page and click "Reload Page"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
