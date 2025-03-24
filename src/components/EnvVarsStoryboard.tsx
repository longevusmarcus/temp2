import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

const EnvVarsStoryboard = () => {
  const [envVars, setEnvVars] = useState({
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID as string,
    supabaseServiceKey: import.meta.env.VITE_SUPABASE_SERVICE_KEY as string,
  });

  const maskString = (str: string) => {
    if (!str) return "Not set";
    return str.length > 10
      ? `${str.substring(0, 5)}...${str.substring(str.length - 5)}`
      : "Set but too short";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-purple-400">
            Environment Variables Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            <p>Current environment variables configuration:</p>
          </div>

          <div className="space-y-2 text-xs text-gray-400">
            <p>
              <span className="font-medium">Supabase URL:</span>{" "}
              {maskString(envVars.supabaseUrl)}
            </p>
            <p>
              <span className="font-medium">Anon Key:</span>{" "}
              {maskString(envVars.supabaseAnonKey)}
            </p>
            <p>
              <span className="font-medium">Project ID:</span>{" "}
              {maskString(envVars.supabaseProjectId)}
            </p>
            <p>
              <span className="font-medium">Service Key:</span>{" "}
              {maskString(envVars.supabaseServiceKey)}
            </p>
          </div>

          <Alert
            className={`mt-4 ${Object.values(envVars).every(Boolean) ? "bg-green-900/30 border-green-800" : "bg-amber-900/30 border-amber-800"}`}
          >
            <div className="flex items-start">
              {Object.values(envVars).every(Boolean) ? (
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 mr-2" />
              )}
              <div>
                <AlertTitle
                  className={
                    Object.values(envVars).every(Boolean)
                      ? "text-green-400"
                      : "text-amber-400"
                  }
                >
                  {Object.values(envVars).every(Boolean)
                    ? "All Environment Variables Set"
                    : "Some Environment Variables Missing"}
                </AlertTitle>
                <AlertDescription className="text-sm mt-1">
                  {Object.values(envVars).every(Boolean)
                    ? "All required environment variables are properly configured."
                    : "Some environment variables are missing or not properly configured. Please check the project settings."}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvVarsStoryboard;
