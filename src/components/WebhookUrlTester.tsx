import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Info, Plus, AlertTriangle } from "lucide-react";

export default function WebhookUrlTester() {
  const [baseUrl, setBaseUrl] = useState<string>(
    "https://eloquent-curran1-9lub6.dev-2.tempolabs.ai",
  );
  const [customPath, setCustomPath] = useState<string>("");
  const [results, setResults] = useState<
    Array<{
      url: string;
      status: number;
      message: string;
      headers?: Record<string, string>;
      responseText?: string;
    }>
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Common URL patterns to test
  const urlVariations = [
    "/polar-webhook",
    "/polar-webhook/",
    "/functions/v1/polar-webhook",
    "/functions/v1/polar-webhook/",
    "/api/polar-webhook",
    "/api/polar-webhook/",
    "/webhook",
    "/webhook/",
    "/webhooks/polar",
    "/webhooks/polar/",
    // Add the double slash path that returned 204
    "/polar-webhook//polar-webhook",
  ];

  const testUrl = async (fullUrl: string) => {
    try {
      // First try OPTIONS request
      const optionsResponse = await fetch(fullUrl, {
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

      return {
        url: fullUrl,
        status: optionsResponse.status,
        message:
          optionsResponse.status === 200
            ? "✅ Endpoint found!"
            : optionsResponse.status === 204
              ? "✅ Endpoint found (No Content)"
              : optionsResponse.status === 404
                ? "❌ Not found"
                : `⚠️ Returned ${optionsResponse.status} ${optionsResponse.statusText}`,
        headers,
        responseText,
      };
    } catch (error) {
      return {
        url: fullUrl,
        status: 0,
        message: `❌ Error: ${error.message}`,
      };
    }
  };

  const testAllUrls = async () => {
    if (!baseUrl) {
      return;
    }

    setLoading(true);
    setResults([]);

    const newResults = [];

    // Test all predefined URL variations
    for (const urlPath of urlVariations) {
      const fullUrl = `${baseUrl}${urlPath}`;
      const result = await testUrl(fullUrl);
      newResults.push(result);

      // Update results as we go
      setResults([...newResults]);
    }

    // Test custom path if provided
    if (customPath) {
      const formattedPath = customPath.startsWith("/")
        ? customPath
        : `/${customPath}`;
      const fullUrl = `${baseUrl}${formattedPath}`;
      const result = await testUrl(fullUrl);
      newResults.push(result);

      // Update results
      setResults([...newResults]);
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Webhook URL Finder</CardTitle>
        <CardDescription>
          Test different URL patterns to find your webhook endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            When deploying to Supabase, your webhook endpoint might be at{" "}
            <code>/functions/v1/polar-webhook</code> instead of just{" "}
            <code>/polar-webhook</code>
          </AlertDescription>
        </Alert>

        {baseUrl.includes("//polar-webhook") && (
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Your URL contains a double slash (<code>//polar-webhook</code>).
              This might be causing routing issues. Express.js normalizes URLs
              with multiple slashes, which can lead to unexpected behavior.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label htmlFor="base-url" className="text-sm font-medium">
            Base URL
          </label>
          <Input
            id="base-url"
            placeholder="https://your-base-url.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Example: https://eloquent-curran1-9lub6.dev-2.tempolabs.ai
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>
        </div>

        {showAdvanced && (
          <div className="space-y-2">
            <label htmlFor="custom-path" className="text-sm font-medium">
              Custom Path to Test
            </label>
            <Input
              id="custom-path"
              placeholder="/your-custom-path"
              value={customPath}
              onChange={(e) => setCustomPath(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Add a custom path to test in addition to the predefined variations
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Results</label>
          <div className="border rounded-md p-4 bg-gray-50 space-y-2 max-h-80 overflow-y-auto">
            {results.length > 0 ? (
              results.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md ${
                    result.status === 200 || result.status === 204
                      ? "bg-green-100 border border-green-200"
                      : result.status === 404
                        ? "bg-gray-100 border border-gray-200"
                        : "bg-yellow-100 border border-yellow-200"
                  }`}
                >
                  <div className="font-mono text-sm break-all">
                    {result.url}
                  </div>
                  <div className="text-sm mt-1 font-medium">
                    {result.message}
                  </div>

                  {showAdvanced &&
                    result.headers &&
                    Object.keys(result.headers).length > 0 && (
                      <div className="mt-2 text-xs">
                        <details>
                          <summary className="cursor-pointer font-medium">
                            Response Headers
                          </summary>
                          <div className="mt-1 p-2 bg-white rounded border">
                            {Object.entries(result.headers).map(
                              ([key, value]) => (
                                <div key={key} className="font-mono">
                                  <span className="font-medium">{key}:</span>{" "}
                                  {value}
                                </div>
                              ),
                            )}
                          </div>
                        </details>
                      </div>
                    )}

                  {showAdvanced && result.responseText && (
                    <div className="mt-2 text-xs">
                      <details>
                        <summary className="cursor-pointer font-medium">
                          Response Body
                        </summary>
                        <div className="mt-1 p-2 bg-white rounded border overflow-x-auto">
                          <pre className="font-mono whitespace-pre-wrap">
                            {result.responseText || "(empty)"}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">
                Click "Test URLs" to check endpoint variations
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={testAllUrls} disabled={loading}>
          {loading ? "Testing..." : "Test URLs"}
        </Button>
      </CardFooter>
    </Card>
  );
}
