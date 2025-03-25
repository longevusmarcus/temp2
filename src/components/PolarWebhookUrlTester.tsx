import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export default function PolarWebhookUrlTester() {
  const [url, setUrl] = useState<string>(
    "https://mbqihswchccmvqmjlpwq.supabase.co/functions/v1/polar-webhook/",
  );
  const [result, setResult] = useState<{
    status: number;
    message: string;
    headers?: Record<string, string>;
    responseText?: string;
    success?: boolean;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<{
    online: boolean;
    latency?: number;
  }>({ online: navigator.onLine });

  // Check network connectivity
  useEffect(() => {
    const checkNetworkStatus = async () => {
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
        }));
      } catch (error) {
        console.warn("Network latency check failed:", error);
        setNetworkStatus((prev) => ({
          ...prev,
          latency: undefined,
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

  const testUrl = async () => {
    if (!url) return;

    setLoading(true);
    setResult(null);

    try {
      // First try OPTIONS request to check CORS
      const optionsResponse = await fetch(url, {
        method: "OPTIONS",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Get response headers
      const headers: Record<string, string> = {};
      optionsResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Try to get response text if possible
      let responseText = "";
      try {
        responseText = await optionsResponse.text();
      } catch (e) {
        // Ignore errors when getting response text
      }

      // Now try a GET request
      const getResponse = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let getResponseText = "";
      try {
        getResponseText = await getResponse.text();
      } catch (e) {
        // Ignore errors when getting response text
      }

      // Combine results
      setResult({
        status: getResponse.status,
        message:
          getResponse.status === 200
            ? "✅ Endpoint found and working!"
            : getResponse.status === 204
              ? "✅ Endpoint found (No Content)"
              : getResponse.status === 404
                ? "❌ Not found"
                : getResponse.status === 405
                  ? "✅ Endpoint found (Method Not Allowed - this is expected for GET requests to webhook endpoints)"
                  : `⚠️ Returned ${getResponse.status} ${getResponse.statusText}`,
        headers,
        responseText: getResponseText || responseText,
        success: [200, 204, 405].includes(getResponse.status),
      });
    } catch (error) {
      console.error("Error testing webhook URL:", error);
      setResult({
        status: 0,
        message: `❌ Error: ${error.message}`,
        error: error.message,
        success: false,
      });

      // Provide more detailed error information
      if (error.message.includes("Failed to fetch")) {
        setResult((prev) => ({
          ...prev,
          error:
            "Failed to fetch - This could be due to CORS restrictions, network connectivity issues, or the endpoint doesn't exist.",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Try with no-cors mode if regular fetch fails
  const testWithNoCors = async () => {
    if (!url) return;

    setLoading(true);
    setResult((prev) => ({
      ...prev,
      message: "Testing with no-cors mode...",
    }));

    try {
      // Try with no-cors mode
      const response = await fetch(url, {
        method: "GET",
        mode: "no-cors",
        cache: "no-cache",
      });

      // With no-cors, we can't read the response, but we can check if the request succeeded
      setResult({
        status: 0, // We can't know the actual status with no-cors
        message: "✅ Endpoint is reachable with no-cors mode",
        success: true,
        responseText: "(Response details not available in no-cors mode)",
      });
    } catch (error) {
      console.error("Error testing webhook URL with no-cors:", error);
      setResult({
        status: 0,
        message: `❌ Error even with no-cors mode: ${error.message}`,
        error: error.message,
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Polar Webhook URL Tester
        </CardTitle>
        <CardDescription className="text-gray-400">
          Test your Supabase Edge Function webhook endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status Indicator */}
        <Alert
          className={`mb-4 ${networkStatus.online ? "bg-green-900/30 border-green-800" : "bg-red-900/30 border-red-800"}`}
        >
          <div className="flex items-start">
            {networkStatus.online ? (
              <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 mr-2" />
            )}
            <AlertDescription className="text-sm">
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
                </>
              ) : (
                <>
                  Your device appears to be offline. Please check your internet
                  connection.
                </>
              )}
            </AlertDescription>
          </div>
        </Alert>

        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            When testing a webhook endpoint, a 405 Method Not Allowed response
            for GET requests is actually expected and indicates the endpoint
            exists. Webhooks typically only accept POST requests with specific
            payloads.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <label
            htmlFor="webhook-url"
            className="text-sm font-medium text-gray-300"
          >
            Webhook URL
          </label>
          <Input
            id="webhook-url"
            placeholder="https://your-project-id.supabase.co/functions/v1/polar-webhook/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {result && (
          <div
            className={`p-4 rounded-md ${result.success ? "bg-green-900/30 border border-green-800" : "bg-red-900/30 border border-red-800"}`}
          >
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
              )}
              <div>
                <div className="font-medium text-lg">
                  {result.success ? "Success" : "Error"}
                </div>
                <div className="mt-1">{result.message}</div>

                {result.error && (
                  <div className="mt-2 text-sm bg-red-950 p-3 rounded border border-red-900">
                    <div className="font-medium mb-1">Error Details:</div>
                    <div className="font-mono">{result.error}</div>

                    {result.error.includes("Failed to fetch") && (
                      <div className="mt-3 space-y-2">
                        <div className="font-medium">Possible causes:</div>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                          <li>CORS restrictions preventing browser access</li>
                          <li>The endpoint doesn't exist or is not deployed</li>
                          <li>Network connectivity issues</li>
                          <li>Firewall or proxy blocking the request</li>
                          <li>
                            Supabase service is down or experiencing issues
                          </li>
                        </ul>
                        <div className="mt-2">
                          Try the "Test with no-cors mode" button below, which
                          may bypass CORS restrictions.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.responseText && (
                  <div className="mt-3">
                    <details>
                      <summary className="cursor-pointer font-medium text-sm">
                        Response Details
                      </summary>
                      <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-700 overflow-x-auto">
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {result.responseText || "(empty)"}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">
            Troubleshooting Tips:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
            <li>Verify your Supabase project ID is correct</li>
            <li>
              Check that the function is deployed in the Supabase dashboard
            </li>
            <li>
              Ensure the URL format is correct (should include /functions/v1/)
            </li>
            <li>Try accessing from a different network or device</li>
            <li>
              Check if your browser extensions might be blocking the request
            </li>
            <li>Verify that CORS headers are properly set in your function</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          onClick={testWithNoCors}
          disabled={loading}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test with no-cors mode"
          )}
        </Button>
        <Button
          onClick={testUrl}
          disabled={loading || !networkStatus.online}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Webhook URL"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
