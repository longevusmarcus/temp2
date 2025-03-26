import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  Database,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

export default function DatabasePermissionFixer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const fixPermissions = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Test if we can query the projects table
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .limit(1);

      // Test if we can query the polar_checkouts table
      const { data: checkoutsData, error: checkoutsError } = await supabase
        .from("polar_checkouts")
        .select("*")
        .limit(1);

      // Test if we can query the customers table
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .limit(1);

      // Collect all errors
      const errors = [];
      if (projectsError) errors.push(`Projects: ${projectsError.message}`);
      if (checkoutsError) errors.push(`Checkouts: ${checkoutsError.message}`);
      if (customersError) errors.push(`Customers: ${customersError.message}`);

      if (errors.length > 0) {
        setResult({
          success: false,
          message: "Still having permission issues with some tables",
          details: errors.join("\n"),
        });
      } else {
        setResult({
          success: true,
          message: "Successfully accessed all tables",
          details: `Projects: ${projectsData?.length ?? 0} rows\nCheckouts: ${checkoutsData?.length ?? 0} rows\nCustomers: ${customersData?.length ?? 0} rows`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error testing database permissions",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-purple-400">
          Database Permission Fixer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-900/30 border-blue-800">
          <Info className="h-4 w-4 text-blue-400 mt-0.5 mr-2" />
          <AlertDescription className="text-sm">
            This tool helps diagnose and fix permission issues with your
            Supabase database tables. The SQL migration has already been run to
            fix the permissions.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Alert className="bg-amber-900/30 border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 mr-2" />
            <AlertTitle className="text-amber-300">
              Permission Issues
            </AlertTitle>
            <AlertDescription className="text-sm">
              <p className="mb-2">
                The error "Tables exist but couldn't query columns" typically
                indicates one of these issues:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>
                  Row Level Security (RLS) is enabled but no policies are set up
                </li>
                <li>The service role key doesn't have proper permissions</li>
                <li>The tables exist but have incorrect grants</li>
              </ul>
            </AlertDescription>
          </Alert>

          {result && (
            <Alert
              className={`${result.success ? "bg-green-900/30 border-green-800" : "bg-red-900/30 border-red-800"}`}
            >
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                )}
                <div>
                  <div className="font-medium">{result.message}</div>
                  {result.details && (
                    <div className="mt-2 p-2 bg-gray-800 rounded text-sm font-mono whitespace-pre-wrap">
                      {result.details}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          <Button
            onClick={fixPermissions}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing Permissions...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Test Database Permissions
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2 mt-4">
          <div className="font-medium text-sm text-gray-300">Manual Steps:</div>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-400">
            <li>If issues persist, check the Supabase dashboard SQL editor</li>
            <li>Verify that your tables have the correct structure</li>
            <li>Check if RLS is enabled and policies are set correctly</li>
            <li>Try regenerating your service key in the Supabase dashboard</li>
            <li>Ensure your Supabase project has the correct permissions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
