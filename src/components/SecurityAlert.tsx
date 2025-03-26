import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Shield, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function SecurityAlert() {
  const [showSteps, setShowSteps] = useState(false);
  const [completed, setCompleted] = useState(false);

  return (
    <Card className="w-full bg-red-50 border-red-200">
      <CardHeader className="bg-red-100 border-b border-red-200">
        <div className="flex items-center">
          <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
          <CardTitle className="text-red-800">
            Security Alert: Exposed Credentials
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <Alert variant="destructive" className="border-red-800 bg-red-100">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Security Issue</AlertTitle>
          <AlertDescription>
            GitGuardian has detected a Supabase Service Role JWT exposed in your
            GitHub account. This is a high-severity security issue that requires
            immediate action.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h3 className="font-medium text-red-800">Impact:</h3>
          <ul className="list-disc pl-5 space-y-1 text-red-700">
            <li>Full database access with admin privileges</li>
            <li>Ability to bypass Row Level Security</li>
            <li>Access to all user data and authentication</li>
            <li>Ability to create, modify, and delete any data</li>
          </ul>
        </div>

        <Button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          {showSteps ? "Hide Remediation Steps" : "Show Remediation Steps"}
        </Button>

        {showSteps && (
          <div className="border border-red-200 rounded-md p-4 bg-white">
            <h3 className="font-medium text-red-800 mb-3">
              Immediate Actions Required:
            </h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li className="text-gray-800">
                <div className="font-medium">
                  Rotate your Supabase service role key immediately
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Go to the Supabase dashboard → Project Settings → API →
                  Generate a new service_role key
                </div>
              </li>
              <li className="text-gray-800">
                <div className="font-medium">
                  Update all environment variables
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Replace the old key with the new one in all environments
                  (development, staging, production)
                </div>
              </li>
              <li className="text-gray-800">
                <div className="font-medium">
                  Remove the exposed key from Git history
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Use tools like BFG Repo-Cleaner or git-filter-repo to remove
                  sensitive data from Git history
                </div>
              </li>
              <li className="text-gray-800">
                <div className="font-medium">Add .env to .gitignore</div>
                <div className="text-sm text-gray-600 mt-1">
                  Ensure all environment files (.env, .env.local, etc.) are in
                  your .gitignore file
                </div>
              </li>
              <li className="text-gray-800">
                <div className="font-medium">Set up secret scanning</div>
                <div className="text-sm text-gray-600 mt-1">
                  Configure pre-commit hooks or use tools like GitGuardian to
                  prevent future leaks
                </div>
              </li>
              <li className="text-gray-800">
                <div className="font-medium">Audit for unauthorized access</div>
                <div className="text-sm text-gray-600 mt-1">
                  Check Supabase logs for any suspicious activity since the key
                  was exposed
                </div>
              </li>
            </ol>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <div className="font-medium text-blue-800">
                    Best Practices for Credential Management:
                  </div>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-blue-700">
                    <li>Never commit .env files or credentials to Git</li>
                    <li>
                      Use environment variables for all sensitive credentials
                    </li>
                    <li>
                      Consider using a secrets manager like AWS Secrets Manager
                      or HashiCorp Vault
                    </li>
                    <li>
                      Implement the principle of least privilege for all service
                      accounts
                    </li>
                    <li>
                      Regularly rotate all credentials, especially for
                      production environments
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setCompleted(true)}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
            >
              Mark as Addressed
            </Button>
          </div>
        )}

        {completed && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <div className="font-medium text-green-800">
                Marked as addressed
              </div>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Remember to verify that all steps have been completed properly to
              ensure your environment is secure.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
