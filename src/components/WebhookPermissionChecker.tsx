import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Info, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function WebhookPermissionChecker() {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<{
    hasServiceKey: boolean;
    hasCorrectPermissions: boolean;
    canCreateFunction: boolean;
    canUpdateFunction: boolean;
    error?: string;
  }>({
    hasServiceKey: false,
    hasCorrectPermissions: false,
    canCreateFunction: false,
    canUpdateFunction: false,
  });

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    setLoading(true);

    try {
      // Check if service key is available
      const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;

      if (!serviceKey) {
        setPermissions({
          hasServiceKey: false,
          hasCorrectPermissions: false,
          canCreateFunction: false,
          canUpdateFunction: false,
          error: "Service key is not set in environment variables",
        });
        setLoading(false);
        return;
      }

      // Check if the service key has the correct format
      const isValidFormat =
        serviceKey.startsWith("eyJ") && serviceKey.includes(".");
      if (!isValidFormat) {
        setPermissions({
          hasServiceKey: true,
          hasCorrectPermissions: false,
          canCreateFunction: false,
          canUpdateFunction: false,
          error: "Service key has invalid format",
        });
        setLoading(false);
        return;
      }

      // Create Supabase client with service key
      const supabase = createClient(supabaseUrl, serviceKey);

      // Test if we can access RPC functions (requires service role)
      try {
        const { data, error } = await supabase.rpc(
          "test_service_key_permissions",
        );
        if (error) throw error;

        setPermissions((prev) => ({
          ...prev,
          hasServiceKey: true,
          hasCorrectPermissions: true,
        }));
      } catch (error) {
        console.warn("RPC test failed:", error);
        // Continue with other tests
      }

      // Test if we can create a function (direct API call)
      try {
        const response = await fetch(
          `https://api.supabase.com/v1/projects/${projectId}/functions`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceKey}`,
            },
          },
        );

        const canList = response.status === 200;
        setPermissions((prev) => ({
          ...prev,
          hasServiceKey: true,
          canCreateFunction: canList,
        }));
      } catch (error) {
        console.error("Function API test failed:", error);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      setPermissions({
        hasServiceKey: false,
        hasCorrectPermissions: false,
        canCreateFunction: false,
        canUpdateFunction: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Webhook Permissions Checker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool checks if your Supabase service key has the necessary
            permissions to deploy and manage edge functions.
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400 mr-2" />
            <span>Checking permissions...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start">
                {permissions.hasServiceKey ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                )}
                <div>
                  <div className="font-medium">Service Key</div>
                  <div className="text-sm text-gray-400">
                    {permissions.hasServiceKey
                      ? "Service key is available"
                      : "Service key is missing"}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                {permissions.hasCorrectPermissions ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                )}
                <div>
                  <div className="font-medium">Service Role Permissions</div>
                  <div className="text-sm text-gray-400">
                    {permissions.hasCorrectPermissions
                      ? "Key has service role permissions"
                      : "Key may not have service role permissions"}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                {permissions.canCreateFunction ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                )}
                <div>
                  <div className="font-medium">Function Management</div>
                  <div className="text-sm text-gray-400">
                    {permissions.canCreateFunction
                      ? "Can manage edge functions"
                      : "May not have permission to manage edge functions"}
                  </div>
                </div>
              </div>
            </div>

            {permissions.error && (
              <Alert className="bg-red-900/30 border-red-800">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
                <AlertTitle className="text-red-400">Error</AlertTitle>
                <AlertDescription className="text-sm">
                  {permissions.error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="font-medium text-sm">Troubleshooting Tips:</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
                <li>
                  Make sure you're using the <strong>service role key</strong>,
                  not the anon key
                </li>
                <li>
                  Check that your service key has the correct format (starts
                  with "eyJ" and contains periods)
                </li>
                <li>Verify that your project ID is correct</li>
                <li>
                  Try regenerating your service key in the Supabase dashboard
                </li>
                <li>Ensure your Supabase project has edge functions enabled</li>
              </ul>
            </div>

            <Button
              onClick={checkPermissions}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Permissions Again"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
