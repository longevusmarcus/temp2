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
          Authorization: "Bearer test", // Add a test auth header to check if it's allowed
        },
        // Add a timeout to prevent long hanging requests
        signal: AbortSignal.timeout(10000),
      });

      // Get response headers
      const headers: Record<string, string> = {};
      optionsResponse.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Check for CORS headers specifically
      const corsHeadersPresent = {
        allowOrigin: headers["access-control-allow-origin"] !== undefined,
        allowMethods: headers["access-control-allow-methods"] !== undefined,
        allowHeaders: headers["access-control-allow-headers"] !== undefined,
      };

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
        // Add a timeout to prevent long hanging requests
        signal: AbortSignal.timeout(10000),
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
        corsInfo: corsHeadersPresent,
      });
    } catch (error) {
      console.error("Error testing webhook URL:", error);

      // Check if it's an abort error (timeout)
      const isTimeout =
        error.name === "TimeoutError" || error.name === "AbortError";

      setResult({
        status: 0,
        message: isTimeout
          ? `❌ Error: Request timed out after 10 seconds`
          : `❌ Error: ${error.message}`,
        error: isTimeout
          ? "Request timed out - The server might be slow to respond or not responding at all."
          : error.message,
        success: false,
      });

      // Provide more detailed error information
      if (error.message.includes("Failed to fetch")) {
        // Try to determine if it's a CORS issue or something else
        const isSameOrigin = url.startsWith(window.location.origin);
        const isLocalhost =
          url.includes("localhost") || url.includes("127.0.0.1");
        const isSupabaseUrl = url.includes(".supabase.co/");

        let detailedError = "Failed to fetch - ";

        if (!isSameOrigin && !isLocalhost) {
          detailedError +=
            "This is likely due to CORS restrictions. Supabase Edge Functions require proper CORS headers to be accessed from a browser.";
        } else if (isSupabaseUrl) {
          detailedError +=
            "This could be because the function is not deployed, the URL is incorrect, or the Supabase project is not accessible.";
        } else {
          detailedError +=
            "This could be due to network connectivity issues, the endpoint doesn't exist, or server-side errors.";
        }

        setResult((prev) => ({
          ...prev,
          error: detailedError,
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
        signal: AbortSignal.timeout(10000), // Add timeout
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

      // Check if it's a timeout
      const isTimeout =
        error.name === "TimeoutError" || error.name === "AbortError";

      setResult({
        status: 0,
        message: isTimeout
          ? `❌ Error: Request timed out after 10 seconds`
          : `❌ Error even with no-cors mode: ${error.message}`,
        error: isTimeout
          ? "Request timed out - The server might be slow to respond or not responding at all."
          : error.message,
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test with a direct POST request (simulating a webhook call)
  const testWithPost = async () => {
    if (!url) return;

    setLoading(true);
    setResult((prev) => ({
      ...prev,
      message: "Testing with POST request...",
    }));

    try {
      // Try a simple POST request with a minimal payload
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(10000), // Add timeout
      });

      // Get response headers
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Try to get response text
      let responseText = "";
      try {
        responseText = await response.text();
      } catch (e) {
        // Ignore errors when getting response text
      }

      setResult({
        status: response.status,
        message:
          response.status >= 200 && response.status < 300
            ? "✅ POST request successful! The webhook endpoint is working."
            : response.status === 405
              ? "❌ Method Not Allowed - The endpoint exists but doesn't accept POST requests (unusual for a webhook)"
              : response.status === 404
                ? "❌ Not found - The endpoint URL is incorrect or not deployed"
                : `⚠️ POST request returned ${response.status} ${response.statusText}`,
        headers,
        responseText,
        success: response.status >= 200 && response.status < 300,
      });
    } catch (error) {
      console.error("Error testing webhook URL with POST:", error);

      // Check if it's a timeout
      const isTimeout =
        error.name === "TimeoutError" || error.name === "AbortError";

      setResult({
        status: 0,
        message: isTimeout
          ? `❌ Error: POST request timed out after 10 seconds`
          : `❌ Error with POST request: ${error.message}`,
        error: isTimeout
          ? "Request timed out - The server might be slow to respond or not responding at all."
          : error.message,
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
                          Try the "Test with no-cors mode" or "Test with POST"
                          buttons below, which may help diagnose the issue.
                        </div>
                      </div>
                    )}

                    {result.corsInfo && (
                      <div className="mt-3">
                        <div className="font-medium">CORS Headers Check:</div>
                        <ul className="list-disc pl-5 space-y-1 text-xs mt-1">
                          <li>
                            Access-Control-Allow-Origin:{" "}
                            {result.corsInfo.allowOrigin ? (
                              <span className="text-green-400">Present</span>
                            ) : (
                              <span className="text-red-400">Missing</span>
                            )}
                          </li>
                          <li>
                            Access-Control-Allow-Methods:{" "}
                            {result.corsInfo.allowMethods ? (
                              <span className="text-green-400">Present</span>
                            ) : (
                              <span className="text-red-400">Missing</span>
                            )}
                          </li>
                          <li>
                            Access-Control-Allow-Headers:{" "}
                            {result.corsInfo.allowHeaders ? (
                              <span className="text-green-400">Present</span>
                            ) : (
                              <span className="text-red-400">Missing</span>
                            )}
                          </li>
                        </ul>
                        {(!result.corsInfo.allowOrigin ||
                          !result.corsInfo.allowMethods ||
                          !result.corsInfo.allowHeaders) && (
                          <div className="mt-2 text-xs bg-yellow-900/30 p-2 rounded">
                            Missing CORS headers detected. Your Supabase Edge
                            Function needs to include proper CORS headers.
                            <div className="mt-1 font-mono text-xs bg-gray-800 p-2 rounded">
                              <div>
                                // Example CORS headers for your Edge Function:
                              </div>
                              <div>const corsHeaders = &#123;</div>
                              <div>
                                &nbsp;&nbsp;'Access-Control-Allow-Origin': '*',
                              </div>
                              <div>
                                &nbsp;&nbsp;'Access-Control-Allow-Headers':
                                'authorization, x-client-info, apikey,
                                content-type',
                              </div>
                              <div>
                                &nbsp;&nbsp;'Access-Control-Allow-Methods':
                                'GET, POST, OPTIONS',
                              </div>
                              <div>&#125;;</div>
                            </div>
                          </div>
                        )}
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

          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-800 rounded">
            <div className="font-medium text-sm mb-1">
              Common CORS Issues with Supabase Edge Functions:
            </div>
            <div className="text-xs text-gray-300">
              <p className="mb-2">
                If you're getting CORS errors, make sure your Edge Function
                includes the following code:
              </p>
              <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-xs">
                {`// Handle OPTIONS request for CORS
if (req.method === 'OPTIONS') {
  return new Response('ok', {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }
  })
}

// Also add CORS headers to your actual response
return new Response(JSON.stringify(data), {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  }
})`}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={testWithNoCors}
            disabled={loading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            title="Attempts to connect using no-cors mode, which may bypass some CORS restrictions but provides limited information"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test with no-cors"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={testWithPost}
            disabled={loading}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            title="Sends a POST request with a test payload, which is how webhooks are typically called"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test with POST"
            )}
          </Button>
        </div>
        <Button
          onClick={testUrl}
          disabled={loading || !networkStatus.online}
          className="bg-purple-600 hover:bg-purple-700"
          title="Standard test that checks if the endpoint exists and has proper CORS headers"
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
