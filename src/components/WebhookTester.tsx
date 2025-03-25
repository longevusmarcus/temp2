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

export default function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [payload, setPayload] = useState<string>(
    JSON.stringify(
      {
        type: "test_event",
        data: {
          message: "This is a test webhook event",
        },
      },
      null,
      2,
    ),
  );

  const testWithCurl = async () => {
    if (!webhookUrl) {
      setResult("Please enter a webhook URL");
      return;
    }

    setLoading(true);
    setResult("Running curl command...");

    try {
      // We'll use the browser's fetch API to simulate a curl request
      // This is a simple POST request with verbose logging in the result
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
      });

      // Get the response text
      const responseText = await response.text();

      // Format the result to mimic curl -vvv output
      let curlResult = `> POST ${webhookUrl} HTTP/1.1\n`;
      curlResult += `> Content-Type: application/json\n`;
      curlResult += `> Content-Length: ${payload.length}\n\n`;
      curlResult += `${payload}\n\n`;
      curlResult += `< HTTP/1.1 ${response.status} ${response.statusText}\n`;

      // Add response headers
      response.headers.forEach((value, key) => {
        curlResult += `< ${key}: ${value}\n`;
      });

      curlResult += `\n${responseText}`;

      setResult(curlResult);
    } catch (error) {
      setResult(
        `Error: ${error.message}\n\nNote: If you're testing a local endpoint, browser security may prevent this request. For local testing, use the terminal command:\n\ncurl -vvv -X POST ${webhookUrl} -H "Content-Type: application/json" -d '${payload.replace(/\n/g, " ").replace(/'/g, "\\'")}'`,
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCommand = () => {
    const command = `curl -vvv -X POST ${webhookUrl} -H "Content-Type: application/json" -d '${payload.replace(/\n/g, " ").replace(/'/g, "\\'")}'`;
    navigator.clipboard.writeText(command);
    setResult((prev) => prev + "\n\nCommand copied to clipboard!");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
        <CardDescription>
          Test your webhook endpoint with a simulated curl request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="webhook-url" className="text-sm font-medium">
            Webhook URL
          </label>
          <Input
            id="webhook-url"
            placeholder="https://your-webhook-url.com"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Example:
            https://eloquent-curran1-9lub6.dev-2.tempolabs.ai/polar-webhook
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="payload" className="text-sm font-medium">
            JSON Payload
          </label>
          <Textarea
            id="payload"
            rows={8}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="result" className="text-sm font-medium">
            Result
          </label>
          <Textarea
            id="result"
            rows={12}
            value={result}
            readOnly
            className="font-mono text-sm bg-gray-50"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={copyCommand} disabled={!webhookUrl}>
          Copy curl Command
        </Button>
        <Button onClick={testWithCurl} disabled={loading}>
          {loading ? "Testing..." : "Test Webhook"}
        </Button>
      </CardFooter>
    </Card>
  );
}
