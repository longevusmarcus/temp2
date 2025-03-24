import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Code,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
} from "lucide-react";
import { deployTestWebhook, deployPolarWebhook } from "@/lib/deploy-functions";

const DeployFunctionsPanel = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    success?: boolean;
    message?: string;
    function?: string;
  } | null>(null);

  const handleDeployTestWebhook = async () => {
    setIsDeploying(true);
    setDeployResult(null);

    try {
      const result = await deployTestWebhook();
      setDeployResult({
        ...result,
        function: "test-webhook",
      });
    } catch (error) {
      setDeployResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        function: "test-webhook",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleDeployPolarWebhook = async () => {
    setIsDeploying(true);
    setDeployResult(null);

    try {
      // Add a small delay to ensure UI updates before starting the deployment
      await new Promise((resolve) => setTimeout(resolve, 100));

      const result = await deployPolarWebhook();
      setDeployResult({
        ...result,
        function: "polar-webhook",
      });
    } catch (error) {
      console.error("Error in handleDeployPolarWebhook:", error);
      setDeployResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
        function: "polar-webhook",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Check if required environment variables are set
  const isMissingProjectId = !import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const isMissingServiceKey = !import.meta.env.VITE_SUPABASE_SERVICE_KEY;

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Deploy Edge Functions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400 mb-4">
          <p>
            Deploy Supabase Edge Functions without requiring the Supabase CLI.
          </p>
          <p className="mt-1">
            This uses the Supabase Management API with your service key.
          </p>
        </div>

        {(isMissingProjectId || isMissingServiceKey) && (
          <Alert className="bg-amber-900/30 border-amber-800 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 mr-2" />
              <div>
                <AlertTitle className="text-amber-400">
                  Missing Environment Variables
                </AlertTitle>
                <AlertDescription className="text-sm mt-1">
                  {isMissingProjectId && (
                    <p className="mb-1">
                      <span className="font-medium">SUPABASE_PROJECT_ID</span>{" "}
                      is not set. This is required for function deployment.
                    </p>
                  )}
                  {isMissingServiceKey && (
                    <p className="mb-1">
                      <span className="font-medium">
                        VITE_SUPABASE_SERVICE_KEY
                      </span>{" "}
                      is not set. This is required for function deployment.
                    </p>
                  )}
                  <p className="mt-2">
                    <span className="font-medium">How to fix:</span> Click the
                    "Go to Project Settings" button below or go to the Tempo
                    dashboard at{" "}
                    <a
                      href="https://app.tempolabs.ai/projects"
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      app.tempolabs.ai/projects
                    </a>
                    . In the Tempo app, you need to add these environment
                    variables directly. Look for the environment variables
                    section and click "Add Variable" to add each of the missing
                    environment variables listed below.
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Supabase URL:</span>{" "}
                    https://mbqihswchccmvqmjlpwq.supabase.co
                  </p>
                  <p className="mt-2">
                    <span className="font-medium">Supabase Anon Key:</span>{" "}
                    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icWloc3djaGNjbXZxbWpscHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NTkxNDEsImV4cCI6MjA1ODIzNTE0MX0.JjNMa7lGtZJ89371LNOI1P4sqx06vitP-K_bkJRDTJA
                  </p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleDeployTestWebhook}
            disabled={isDeploying || isMissingProjectId || isMissingServiceKey}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
          >
            {isDeploying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Code className="mr-2 h-4 w-4" />
            )}
            Deploy Test Webhook
          </Button>

          <Button
            onClick={handleDeployPolarWebhook}
            disabled={isDeploying || isMissingProjectId || isMissingServiceKey}
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
          >
            {isDeploying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Code className="mr-2 h-4 w-4" />
            )}
            Deploy Polar Webhook
          </Button>

          {(isMissingProjectId || isMissingServiceKey) && (
            <Button
              className="w-full mt-2 bg-amber-600 hover:bg-amber-700 flex items-center justify-center"
              onClick={() =>
                window.open("https://app.tempolabs.ai/projects", "_blank")
              }
            >
              <Settings className="mr-2 h-4 w-4" />
              Go to Project Settings
            </Button>
          )}
        </div>

        {deployResult && (
          <Alert
            className={`mt-4 ${deployResult.success ? "bg-green-900/30 border-green-800" : "bg-red-900/30 border-red-800"}`}
          >
            <div className="flex items-start">
              {deployResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
              )}
              <div>
                <AlertTitle
                  className={
                    deployResult.success ? "text-green-400" : "text-red-400"
                  }
                >
                  {deployResult.success
                    ? "Deployment Successful"
                    : "Deployment Failed"}
                </AlertTitle>
                <AlertDescription className="text-sm mt-1">
                  <span className="font-medium">{deployResult.function}</span>:{" "}
                  {deployResult.message}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="text-xs text-gray-500 mt-2">
          <p>Note: Deployment requires the following environment variables:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>SUPABASE_PROJECT_ID</li>
            <li>VITE_SUPABASE_SERVICE_KEY</li>
            <li>VITE_SUPABASE_URL</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeployFunctionsPanel;
