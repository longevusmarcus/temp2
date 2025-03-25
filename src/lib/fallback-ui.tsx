import React from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface EnvironmentErrorFallbackProps {
  errorType: "missing" | "invalid" | null;
}

export const EnvironmentErrorFallback: React.FC<
  EnvironmentErrorFallbackProps
> = ({ errorType }) => {
  const getErrorMessage = () => {
    if (errorType === "missing") {
      return "Missing Supabase environment variables. Please check your environment configuration.";
    } else if (errorType === "invalid") {
      return "Invalid Supabase URL format. Please check your environment configuration.";
    }
    return "Unknown environment error. Please check your configuration.";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[450px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-red-600">Environment Error</CardTitle>
          <CardDescription>
            The application cannot start due to missing or invalid
            configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">{getErrorMessage()}</p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                Please make sure the following environment variables are
                correctly set:
              </p>
              <ul className="list-disc list-inside text-xs text-amber-700 mt-2 space-y-1">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} className="w-full">
            Retry
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

// Additional fallback components can be added here
