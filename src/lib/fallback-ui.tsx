import React from "react";

interface EnvironmentErrorFallbackProps {
  errorType: "missing" | "invalid" | null;
}

/**
 * A fallback UI component that displays when environment variables are missing or invalid
 */
export const EnvironmentErrorFallback = ({
  errorType = "missing",
}: EnvironmentErrorFallbackProps) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-purple-400 mb-4">
          Configuration Error
        </h1>

        <div className="space-y-4">
          <p className="text-gray-300">
            {errorType === "invalid"
              ? "The application couldn't connect to Supabase because the URL is invalid."
              : "The application couldn't connect to Supabase because environment variables are missing."}
          </p>

          <div className="bg-amber-900/30 border border-amber-800 rounded-md p-4 text-sm">
            <h2 className="font-medium text-amber-400 mb-2">
              {errorType === "invalid"
                ? "Invalid Supabase URL"
                : "Missing Environment Variables"}
            </h2>
            <p className="text-gray-300 mb-2">
              Please ensure the following environment variables are set
              correctly in your Netlify dashboard:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>
                VITE_SUPABASE_URL{" "}
                {errorType === "invalid" && "(must be a valid URL format)"}
              </li>
              <li>VITE_SUPABASE_ANON_KEY</li>
              <li>SUPABASE_PROJECT_ID</li>
              <li>SUPABASE_SERVICE_KEY</li>
              <li>VITE_POLAR_ACCESS_TOKEN</li>
            </ul>
          </div>

          {errorType === "invalid" && (
            <div className="bg-red-900/30 border border-red-800 rounded-md p-4 text-sm">
              <h2 className="font-medium text-red-400 mb-2">
                URL Format Error
              </h2>
              <p className="text-gray-300 mb-2">
                The VITE_SUPABASE_URL value is not in a valid URL format. It
                should look like:
              </p>
              <code className="block bg-gray-800 p-2 rounded text-green-400 text-xs overflow-auto">
                https://your-project-id.supabase.co
              </code>
              <p className="text-gray-300 mt-2">
                Make sure there are no extra spaces, quotes, or other characters
                in the value.
              </p>
            </div>
          )}

          <div className="bg-gray-800 p-4 rounded-md">
            <h2 className="font-medium text-gray-300 mb-2">How to fix this:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Go to your Netlify dashboard</li>
              <li>Navigate to Site settings {"&gt;"} Environment variables</li>
              <li>
                Check that all required variables are set{" "}
                {errorType === "invalid" && "with correct formats"}
              </li>
              <li>Trigger a new deployment</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentErrorFallback;
