import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import DeployEdgeFunctionButton from "./DeployEdgeFunctionButton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, Info } from "lucide-react";

const WebhookDeployPanel = () => {
  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Deploy Webhook Function
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-700">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-blue-300">Webhook Deployment</AlertTitle>
          <AlertDescription className="text-blue-200">
            Deploy the Polar webhook function directly using the Supabase API
            instead of the CLI. This will make your webhook endpoint available
            at:
            <code className="block mt-2 p-2 bg-gray-800 rounded text-sm">
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/polar-webhook
            </code>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-4">
          <DeployEdgeFunctionButton
            functionName="polar-webhook"
            buttonText="Deploy Polar Webhook"
            className="bg-purple-600 hover:bg-purple-700"
          />

          <Alert className="bg-amber-900/30 border-amber-700">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-300">Important</AlertTitle>
            <AlertDescription className="text-amber-200">
              After deployment, make sure to configure this webhook URL in your
              Polar dashboard with the webhook secret:
              <code className="block mt-2 p-2 bg-gray-800 rounded text-sm">
                d07e6a6640f441949ad0fb00d6e43e8e
              </code>
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookDeployPanel;
