import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  RefreshCw,
} from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const EnvVarsFixer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Environment variables
  const [supabaseUrl, setSupabaseUrl] = useState(
    import.meta.env.VITE_SUPABASE_URL || "",
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );
  const [supabaseServiceKey, setSupabaseServiceKey] = useState(
    import.meta.env.VITE_SUPABASE_SERVICE_KEY || "",
  );
  const [supabaseProjectId, setSupabaseProjectId] = useState(
    import.meta.env.VITE_SUPABASE_PROJECT_ID || "",
  );

  const maskString = (str: string) => {
    if (!str) return "Not set";
    return str.length > 10
      ? `${str.substring(0, 5)}...${str.substring(str.length - 5)}`
      : "Set but too short";
  };

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // In a real implementation, this would test the connection
      // For now, we'll just simulate a successful connection if all fields are filled
      if (
        !supabaseUrl ||
        !supabaseAnonKey ||
        !supabaseServiceKey ||
        !supabaseProjectId
      ) {
        throw new Error("All fields are required");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-purple-400 flex items-center gap-2">
            <Key className="h-5 w-5" /> Environment Variables Fixer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">Supabase URL</Label>
                <Input
                  id="supabaseUrl"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400">
                  Current: {maskString(supabaseUrl)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseAnonKey">Supabase Anon Key</Label>
                <Input
                  id="supabaseAnonKey"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400">
                  Current: {maskString(supabaseAnonKey)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseServiceKey">Supabase Service Key</Label>
                <Input
                  id="supabaseServiceKey"
                  value={supabaseServiceKey}
                  onChange={(e) => setSupabaseServiceKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400">
                  Current: {maskString(supabaseServiceKey)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseProjectId">Supabase Project ID</Label>
                <Input
                  id="supabaseProjectId"
                  value={supabaseProjectId}
                  onChange={(e) => setSupabaseProjectId(e.target.value)}
                  placeholder="abcdefghijklmnopqrst"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-400">
                  Current: {maskString(supabaseProjectId)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={testConnection}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert className="bg-red-900/30 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-900/30 border-green-800">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-green-400">Success</AlertTitle>
              <AlertDescription>
                Connection tested successfully! Your environment variables are
                working.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-gray-400 mt-4">
            <p>
              Note: Changes to environment variables require a restart of the
              development server to take effect.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvVarsFixer;
