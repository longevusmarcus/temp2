import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import PolarWebhookUrlTester from "./PolarWebhookUrlTester";
import WebhookPermissionChecker from "./WebhookPermissionChecker";
import DatabasePermissionFixer from "./DatabasePermissionFixer";

export default function CombinedTroubleshooter() {
  const [activeTab, setActiveTab] = useState("webhook");

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Supabase Connection Troubleshooter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="webhook"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="webhook">Webhook Tester</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          <TabsContent value="webhook" className="space-y-4">
            <PolarWebhookUrlTester />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <WebhookPermissionChecker />
          </TabsContent>

          <TabsContent value="database" className="space-y-4">
            <DatabasePermissionFixer />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
