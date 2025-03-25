import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface DeployEdgeFunctionButtonProps {
  functionName: string;
  buttonText?: string;
  className?: string;
}

const DeployEdgeFunctionButton = ({
  functionName,
  buttonText = "Deploy Function",
  className = "",
}: DeployEdgeFunctionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deployFunction = async () => {
    setIsLoading(true);
    setStatus("Deploying function...");
    setError(null);

    try {
      // Get Supabase credentials from environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY as string;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error(
          "Supabase URL or Service Key not found in environment variables",
        );
      }

      // Create Supabase client with service key
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Deploy the function using Supabase REST API instead of CLI
      const { data, error: deployError } =
        await supabase.functions.deploy(functionName);

      if (deployError) {
        throw deployError;
      }

      setStatus(`Function ${functionName} deployed successfully!`);
      console.log(`Function ${functionName} deployed:`, data);
    } catch (err: any) {
      console.error(`Error deploying function ${functionName}:`, err);
      setError(err.message || `Failed to deploy ${functionName}`);
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={deployFunction}
        disabled={isLoading}
        className={`${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deploying...
          </>
        ) : (
          buttonText
        )}
      </Button>

      {status && (
        <div className="p-2 bg-green-900/30 border border-green-700 rounded-md text-green-200 text-sm">
          {status}
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default DeployEdgeFunctionButton;
