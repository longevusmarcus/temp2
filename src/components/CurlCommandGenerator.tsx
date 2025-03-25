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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Copy } from "lucide-react";
import { useToast } from "./ui/use-toast";

export default function CurlCommandGenerator() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
  const [includePayload, setIncludePayload] = useState<boolean>(true);
  const [customHeaders, setCustomHeaders] = useState<string>(
    "Content-Type: application/json\nWebhook-Signature: your-signature-here",
  );
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

  const generateCurlCommand = () => {
    if (!webhookUrl) return "";

    let command = `curl -vvv -X POST ${webhookUrl}`;

    if (includeHeaders && customHeaders.trim()) {
      const headerLines = customHeaders
        .split("\n")
        .filter((line) => line.trim());
      headerLines.forEach((header) => {
        const [key, value] = header.split(":").map((part) => part.trim());
        if (key && value) {
          command += ` -H "${key}: ${value}"`;
        }
      });
    }

    if (includePayload && payload.trim()) {
      // Escape single quotes in the payload
      const escapedPayload = payload.replace(/'/g, "\\'").replace(/\n/g, " ");
      command += ` -d '${escapedPayload}'`;
    }

    return command;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The curl command has been copied to your clipboard.",
    });
  };

  const curlCommand = generateCurlCommand();

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle>Curl Command Generator for Webhook Testing</CardTitle>
        <CardDescription>
          Generate a curl command to test your webhook endpoint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="basic">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
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
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url-adv">Webhook URL</Label>
              <Input
                id="webhook-url-adv"
                placeholder="https://your-webhook-url.com"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-headers"
                checked={includeHeaders}
                onCheckedChange={(checked) =>
                  setIncludeHeaders(checked as boolean)
                }
              />
              <Label htmlFor="include-headers">Include Headers</Label>
            </div>

            {includeHeaders && (
              <div className="space-y-2">
                <Label htmlFor="custom-headers">
                  Custom Headers (one per line)
                </Label>
                <Textarea
                  id="custom-headers"
                  rows={4}
                  value={customHeaders}
                  onChange={(e) => setCustomHeaders(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-payload"
                checked={includePayload}
                onCheckedChange={(checked) =>
                  setIncludePayload(checked as boolean)
                }
              />
              <Label htmlFor="include-payload">Include Payload</Label>
            </div>

            {includePayload && (
              <div className="space-y-2">
                <Label htmlFor="payload">JSON Payload</Label>
                <Textarea
                  id="payload"
                  rows={6}
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="curl-command">Generated Curl Command</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(curlCommand)}
              disabled={!curlCommand}
              className="h-8"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            id="curl-command"
            rows={3}
            value={curlCommand}
            readOnly
            className="font-mono text-sm bg-gray-50"
          />
          <p className="text-xs text-gray-500">
            Run this command in your terminal to test the webhook endpoint
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => copyToClipboard(curlCommand)}
          disabled={!curlCommand}
        >
          Copy to Clipboard
        </Button>
      </CardFooter>
    </Card>
  );
}
