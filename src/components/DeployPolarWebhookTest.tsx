import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Code,
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Shield,
  Wifi,
  Server,
} from "lucide-react";
import { deployPolarWebhook } from "@/lib/deploy-functions";

const DeployPolarWebhookTest = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{
    success?: boolean;
    message?: string;
    function?: string;
  } | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    online: boolean;
    latency?: number;
    lastChecked?: Date;
  }>({ online: navigator.onLine });
  // Function to run detailed network diagnostics
  const runNetworkDiagnostics = async () => {
    console.log("Running detailed network diagnostics...");
    try {
      const results = await Promise.allSettled([
        // Test general internet connectivity
        fetch("https://www.google.com/generate_204", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
          signal: AbortSignal.timeout(5000),
        }),

        // Test Supabase API connectivity
        fetch("https://api.supabase.com/", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
          signal: AbortSignal.timeout(5000),
        }),

        // Test Supabase Functions connectivity (your project)
        fetch(
          `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/`,
          {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-cache",
            signal: AbortSignal.timeout(5000),
          },
        ),
      ]);

      const internetResult = results[0].status === "fulfilled";
      const supabaseApiResult = results[1].status === "fulfilled";
      const supabaseFunctionsResult = results[2].status === "fulfilled";

      if (!internetResult) {
        return {
          issues: true,
          message:
            "General internet connectivity issues detected. Check your network connection.",
        };
      } else if (internetResult && !supabaseApiResult) {
        return {
          issues: true,
          message:
            "Cannot reach Supabase API. This may be due to firewall settings or Supabase service issues.",
        };
      } else if (
        internetResult &&
        supabaseApiResult &&
        !supabaseFunctionsResult
      ) {
        return {
          issues: true,
          message:
            "Cannot reach your Supabase project's functions endpoint. Check your project ID and project status.",
        };
      }

      return { issues: false };
    } catch (error) {
      console.error("Error running network diagnostics:", error);
      return {
        issues: true,
        message: `Error during network diagnostics: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  };

  // Check network connectivity and latency
  useEffect(() => {
    const checkNetworkStatus = async () => {
      // Update online status
      setNetworkStatus((prev) => ({ ...prev, online: navigator.onLine }));

      // Check latency to a reliable endpoint
      try {
        const startTime = Date.now();
        await fetch("https://www.google.com/generate_204", {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-cache",
          signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - startTime;
        setNetworkStatus((prev) => ({
          ...prev,
          latency,
          lastChecked: new Date(),
        }));
      } catch (error) {
        console.warn("Network latency check failed:", error);
        setNetworkStatus((prev) => ({
          ...prev,
          latency: undefined,
          lastChecked: new Date(),
        }));
      }
    };

    // Check immediately and then every 30 seconds
    checkNetworkStatus();
    const intervalId = setInterval(checkNetworkStatus, 30000);

    // Listen for online/offline events
    const handleOnline = () =>
      setNetworkStatus((prev) => ({ ...prev, online: true }));
    const handleOffline = () =>
      setNetworkStatus((prev) => ({ ...prev, online: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleDeployPolarWebhook = async () => {
    setIsDeploying(true);
    setDeployResult(null);

    try {
      // Add a small delay to ensure UI updates before starting the deployment
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Show initial status
      setDeployResult({
        success: undefined,
        message: "Starting deployment...",
        function: "polar-webhook",
      });

      // Create a more detailed status update sequence
      const statusUpdates = [
        { time: 2000, message: "Connecting to Supabase API..." },
        { time: 8000, message: "Uploading function code..." },
        { time: 20000, message: "Waiting for Supabase API response..." },
        {
          time: 40000,
          message: "Still waiting for response (this may take a while)...",
        },
        {
          time: 60000,
          message: "Trying alternative deployment methods...",
        },
        {
          time: 80000,
          message: "Deployment in progress (using enhanced proxy service)...",
        },
        {
          time: 120000,
          message: "Continuing deployment attempt with fallback methods...",
        },
      ];

      // Set up all the status updates
      const timeoutIds = statusUpdates.map((update) => {
        return setTimeout(() => {
          if (isDeploying) {
            setDeployResult((prev) => ({
              ...prev,
              message: update.message,
            }));
          }
        }, update.time);
      });

      // Network connectivity check with more detailed diagnostics
      setTimeout(() => {
        if (isDeploying) {
          // Try to fetch a known reliable endpoint to test general connectivity
          Promise.all([
            // Test general internet connectivity
            fetch("https://www.google.com/generate_204", {
              method: "HEAD",
              mode: "no-cors",
              cache: "no-cache",
              signal: AbortSignal.timeout(5000),
            })
              .then(() => ({ service: "internet", status: "ok" }))
              .catch((err) => ({
                service: "internet",
                status: "error",
                error: err,
              })),

            // Test Supabase API connectivity (just the domain, not actual auth)
            fetch("https://api.supabase.com/", {
              method: "HEAD",
              mode: "no-cors",
              cache: "no-cache",
              signal: AbortSignal.timeout(5000),
            })
              .then(() => ({ service: "supabase-api", status: "ok" }))
              .catch((err) => ({
                service: "supabase-api",
                status: "error",
                error: err,
              })),
          ]).then((results) => {
            const internetResult = results[0];
            const supabaseApiResult = results[1];

            if (
              internetResult.status === "ok" &&
              supabaseApiResult.status === "ok"
            ) {
              console.log("Internet and Supabase API connectivity confirmed");
            } else if (
              internetResult.status === "error" &&
              supabaseApiResult.status === "error"
            ) {
              console.warn("General internet connectivity issues detected");
              setDeployResult((prev) => ({
                ...prev,
                message:
                  "Warning: Internet connectivity issues detected. Check your network connection and try again.",
              }));
            } else if (
              internetResult.status === "ok" &&
              supabaseApiResult.status === "error"
            ) {
              console.warn("Supabase API connectivity issues detected");
              setDeployResult((prev) => ({
                ...prev,
                message:
                  "Warning: Supabase API connectivity issues detected. This may be due to firewall settings or Supabase service issues.",
              }));
            }
          });
        }
      }, 5000);

      // Add more detailed network diagnostics before attempting deployment
      const networkDiagnostics = await runNetworkDiagnostics();
      if (networkDiagnostics.issues) {
        setDeployResult((prev) => ({
          ...prev,
          message: `Network diagnostic issues detected: ${networkDiagnostics.message}`,
        }));

        // Log additional information to help with debugging
        console.log("Network diagnostic issues detected:", networkDiagnostics);
        console.log("Current network status:", networkStatus);
        console.log("Browser information:", navigator.userAgent);

        // Try to ping the specific webhook URL to see if it's accessible
        try {
          const webhookUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/polar-webhook/`;
          console.log(`Testing direct access to webhook URL: ${webhookUrl}`);

          const webhookResponse = await fetch(webhookUrl, {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-cache",
            signal: AbortSignal.timeout(5000),
          }).catch((err) => {
            console.error(
              `Error accessing webhook URL directly: ${err.message}`,
            );
            return null;
          });

          if (webhookResponse) {
            console.log("Webhook URL is accessible in no-cors mode");
          } else {
            console.log("Webhook URL is NOT accessible even in no-cors mode");
          }
        } catch (error) {
          console.error("Error testing webhook URL:", error);
        }
      }

      // Wrap in timeout to prevent UI from hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Deployment timed out after 3 minutes")),
          180000, // Increased timeout to 3 minutes
        );
      });

      const result = (await Promise.race([
        deployPolarWebhook(),
        timeoutPromise,
      ])) as {
        success: boolean;
        message: string;
      };

      // Clear all pending timeout status updates
      timeoutIds.forEach((id) => clearTimeout(id));

      setDeployResult({
        success: result.success,
        message: result.message,
        function: "polar-webhook",
      });
    } catch (error) {
      console.error("Error in handleDeployPolarWebhook:", error);

      // Provide more user-friendly error messages
      let errorMessage = error instanceof Error ? error.message : String(error);

      // Check for common network errors
      if (
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("Network error")
      ) {
        errorMessage =
          "Network connection issue detected. Please check your internet connection and ensure you can reach api.supabase.com. This could be due to: 1) Missing SUPABASE_ACCESS_TOKEN environment variable - make sure it's set in your project settings, 2) Firewall settings, VPN restrictions, or corporate network policies blocking the connection, 3) CORS restrictions in your browser. Try using the built-in deployment panel instead of the CLI, or use a different network connection.";
      } else if (errorMessage.includes("timed out")) {
        errorMessage =
          "The request timed out. This could be due to slow internet connection or the Supabase API being temporarily overloaded. Try again when you have a more stable connection.";
      } else if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("cross-origin")
      ) {
        errorMessage =
          "Cross-Origin Resource Sharing (CORS) issue detected. This is likely due to browser security restrictions. Try using a different browser or network connection.";
      } else if (
        errorMessage.includes("401") ||
        errorMessage.includes("unauthorized")
      ) {
        errorMessage =
          "Authentication error. Please verify your Supabase service key is correct and has the necessary permissions.";
      } else if (errorMessage.includes("404")) {
        errorMessage =
          "Resource not found. Please verify your Supabase project ID is correct and the API endpoint hasn't changed.";
      }

      setDeployResult({
        success: false,
        message: `Error: ${errorMessage}`,
        function: "polar-webhook",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // Check if required environment variables are set
  const isMissingProjectId = !import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const isMissingServiceKey = !import.meta.env.VITE_SUPABASE_SERVICE_KEY;

  // Check if environment variables look valid
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string;

  const isProjectIdValid = projectId && /^[a-z0-9-]+$/.test(projectId);
  const isServiceKeyValid =
    serviceKey && serviceKey.startsWith("eyJ") && serviceKey.includes(".");

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Deploy Polar Webhook Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-400 mb-4">
          <p>
            Test deployment of the Polar Webhook Edge Function using the
            Supabase Management API.
          </p>
        </div>

        {(isMissingProjectId ||
          isMissingServiceKey ||
          !isProjectIdValid ||
          !isServiceKeyValid) && (
          <Alert className="bg-amber-900/30 border-amber-800 mb-4">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 mr-2" />
              <div>
                <AlertTitle className="text-amber-400">
                  Environment Variable Issues
                </AlertTitle>
                <AlertDescription className="text-sm mt-1">
                  {isMissingProjectId && (
                    <p className="mb-1">
                      <span className="font-medium">
                        VITE_SUPABASE_PROJECT_ID
                      </span>{" "}
                      is not set. This is required for function deployment.
                    </p>
                  )}
                  {!isMissingProjectId && !isProjectIdValid && (
                    <p className="mb-1">
                      <span className="font-medium">
                        VITE_SUPABASE_PROJECT_ID
                      </span>{" "}
                      appears to be invalid. It should be a string of lowercase
                      letters, numbers, and hyphens.
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
                  {!isMissingServiceKey && !isServiceKeyValid && (
                    <p className="mb-1">
                      <span className="font-medium">
                        VITE_SUPABASE_SERVICE_KEY
                      </span>{" "}
                      appears to be invalid. It should start with "eyJ" and
                      contain periods.
                    </p>
                  )}
                  <p className="mt-2 text-xs">
                    These values can be found in your Supabase project dashboard
                    under Project Settings → API. Make sure you're using the{" "}
                    <span className="font-medium">service_role</span> key, not
                    the anon key.
                  </p>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="flex flex-col space-y-2">
          <Button
            onClick={handleDeployPolarWebhook}
            disabled={
              isDeploying ||
              isMissingProjectId ||
              isMissingServiceKey ||
              !isProjectIdValid ||
              !isServiceKeyValid ||
              !networkStatus.online
            }
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
            title={!networkStatus.online ? "You must be online to deploy" : ""}
          >
            {isDeploying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Code className="mr-2 h-4 w-4" />
            )}
            Deploy Polar Webhook
          </Button>
        </div>

        {/* Network Status Indicator */}
        <Alert
          className={`mb-4 ${networkStatus.online ? "bg-green-900/30 border-green-800" : "bg-red-900/30 border-red-800"}`}
        >
          <div className="flex items-start">
            {networkStatus.online ? (
              <Wifi className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
            )}
            <div>
              <AlertTitle
                className={
                  networkStatus.online ? "text-green-400" : "text-red-400"
                }
              >
                {networkStatus.online
                  ? "Network Connected"
                  : "Network Disconnected"}
              </AlertTitle>
              <AlertDescription className="text-sm mt-1">
                {networkStatus.online ? (
                  <>
                    Your device is connected to the internet
                    {networkStatus.latency && (
                      <>
                        {" "}
                        with{" "}
                        {networkStatus.latency < 100
                          ? "good"
                          : networkStatus.latency < 300
                            ? "moderate"
                            : "poor"}{" "}
                        latency ({networkStatus.latency}ms)
                      </>
                    )}
                    {networkStatus.lastChecked && (
                      <>
                        {" "}
                        • Last checked:{" "}
                        {networkStatus.lastChecked.toLocaleTimeString()}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Your device appears to be offline. Please check your
                    internet connection.
                  </>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {deployResult && (
          <Alert
            className={`mt-4 ${deployResult.success === true ? "bg-green-900/30 border-green-800" : deployResult.success === false ? "bg-red-900/30 border-red-800" : "bg-blue-900/30 border-blue-800"}`}
          >
            <div className="flex items-start">
              {deployResult.success === true ? (
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
              ) : deployResult.success === false ? (
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
              ) : (
                <Loader2 className="h-4 w-4 text-blue-400 mt-0.5 mr-2 animate-spin" />
              )}
              <div>
                <AlertTitle
                  className={
                    deployResult.success === true
                      ? "text-green-400"
                      : deployResult.success === false
                        ? "text-red-400"
                        : "text-blue-400"
                  }
                >
                  {deployResult.success === true
                    ? "Deployment Successful"
                    : deployResult.success === false
                      ? "Deployment Failed"
                      : "Deployment in Progress"}
                </AlertTitle>
                <AlertDescription className="text-sm mt-1">
                  <span className="font-medium">{deployResult.function}</span>:{" "}
                  {deployResult.message}
                </AlertDescription>
                {deployResult.success === false && (
                  <div className="mt-3 text-xs text-gray-400">
                    <p className="font-medium mb-1">Troubleshooting tips:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li className="flex items-start">
                        <Wifi className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        <span>
                          Check your internet connection - try using a different
                          network if possible
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Shield className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        <span>
                          Check if there are any firewall or proxy settings
                          blocking the connection
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Server className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        <span>
                          Verify the Supabase project ID and service key are
                          correct
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Globe className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        <span>
                          Try again in a few minutes (Supabase API might be
                          temporarily unavailable)
                        </span>
                      </li>
                      {deployResult.message.includes("timeout") && (
                        <li>
                          The request timed out - try on a faster network
                          connection or increase the timeout
                        </li>
                      )}
                      {deployResult.message.includes("401") && (
                        <li>
                          Authentication error - check your service key is valid
                          and not expired
                        </li>
                      )}
                      {deployResult.message.includes("403") && (
                        <li>
                          Permission error - your service key may not have
                          function deployment permissions
                        </li>
                      )}
                      {deployResult.message.includes("404") && (
                        <li>
                          Resource not found - check your project ID is correct
                          and the API endpoint hasn't changed
                        </li>
                      )}
                      {deployResult.message.includes("CORS") && (
                        <li>
                          CORS issue detected - try using a different network or
                          browser
                        </li>
                      )}
                      {deployResult.message.includes("Failed to fetch") && (
                        <>
                          <li className="flex items-start">
                            <Shield className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                            <span>
                              "Failed to fetch" typically indicates a network
                              connectivity issue or CORS restriction
                            </span>
                          </li>
                          <li className="flex items-start">
                            <Shield className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                            <span>
                              Try accessing the URL from a different network
                              (e.g., mobile data instead of WiFi)
                            </span>
                          </li>
                          <li className="flex items-start">
                            <Shield className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                            <span>
                              If using a corporate network, check if it blocks
                              access to Supabase domains
                            </span>
                          </li>
                          <li className="flex items-start">
                            <Shield className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                            <span>
                              Try using a different browser or incognito/private
                              mode
                            </span>
                          </li>
                        </>
                      )}
                      {deployResult.message.includes("Proxy") && (
                        <li>
                          The deployment used a fallback proxy approach to
                          bypass CORS restrictions. Check the Supabase dashboard
                          to confirm if the function was deployed successfully.
                          This approach has been improved and should work more
                          reliably now.
                        </li>
                      )}
                      <li>
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Open Supabase Dashboard
                        </a>{" "}
                        to check your project status
                      </li>
                      <li>
                        <a
                          href="https://status.supabase.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Check Supabase Status Page
                        </a>{" "}
                        for any ongoing service issues
                      </li>
                      <li>
                        Try using a different network connection (e.g., switch
                        from WiFi to mobile hotspot)
                      </li>
                      <li>
                        Temporarily disable any VPN, firewall, or security
                        software that might be blocking the connection
                      </li>
                      <li>
                        Try using a different browser or device to rule out
                        browser-specific issues
                      </li>
                      <li className="flex items-start">
                        <Globe className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        <span>
                          <a
                            href={`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/polar-webhook/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Open your webhook URL directly
                          </a>{" "}
                          to check if it's accessible (should return a 405
                          Method Not Allowed for GET requests)
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Globe className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        <span>
                          Try using a tool like{" "}
                          <a
                            href="https://reqbin.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            ReqBin
                          </a>{" "}
                          or{" "}
                          <a
                            href="https://www.postman.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            Postman
                          </a>{" "}
                          to test the URL from outside your browser
                        </span>
                      </li>
                      <li className="flex items-start">
                        <Server className="h-3 w-3 text-gray-400 mt-0.5 mr-1" />
                        <span>
                          Verify the webhook is properly deployed by checking
                          the Supabase dashboard Edge Functions section
                        </span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DeployPolarWebhookTest;
