import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  Server,
  Key,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const DatabaseConnectionChecker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    connectionTest: any;
    tablesTest: any;
    migrationsTest: any;
    permissionsTest: any;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Display environment variables (masked)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const supabaseProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
  const supabaseServiceKey = import.meta.env
    .VITE_SUPABASE_SERVICE_KEY as string;

  const maskString = (str: string) => {
    if (!str) return "Not set";
    return str.length > 10
      ? `${str.substring(0, 5)}...${str.substring(str.length - 5)}`
      : "Set but too short";
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      // Check if environment variables are set
      if (!supabaseUrl || !supabaseAnonKey) {
        setError(
          "Supabase URL or Anon Key is missing. Please check your environment variables.",
        );
        return;
      }

      const testResults = {
        connectionTest: await testBasicConnection(),
        tablesTest: await testTables(),
        migrationsTest: await testMigrations(),
        permissionsTest: await testPermissions(),
      };

      setResults(testResults);
    } catch (err) {
      setError(
        `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Test 1: Basic Connection
  const testBasicConnection = async () => {
    try {
      // Test if we can connect to Supabase at all using a simple query
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id")
        .limit(1);

      // If projects table exists, we're connected
      if (!projectsError) {
        return {
          success: true,
          message: "Successfully connected to Supabase",
          details: null,
        };
      }

      // If that fails, try polar_checkouts table
      const { data: checkoutsData, error: checkoutsError } = await supabase
        .from("polar_checkouts")
        .select("id")
        .limit(1);

      // Check if we can connect to Supabase at all
      if (!checkoutsError) {
        return {
          success: true,
          message: "Successfully connected to Supabase",
          details: null,
        };
      }

      // If both tables fail, try a simple system query that doesn't involve transactions
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("id")
        .limit(1);

      return {
        success: !error || error.code === "PGRST116", // PGRST116 means table not found, which is expected
        message: !error
          ? "Successfully connected to Supabase"
          : error.code === "PGRST116"
            ? "Connected to Supabase (table not found, but connection works)"
            : `Connection error: ${error.message}`,
        details: error
          ? {
              code: error.code,
              message: error.message,
              hint: error.hint,
              details: error.details,
            }
          : null,
      };
    } catch (err) {
      return {
        success: false,
        message: `Critical connection error: ${err instanceof Error ? err.message : String(err)}`,
        details: { error: String(err) },
      };
    }
  };

  // Test 2: Tables Existence
  const testTables = async () => {
    try {
      // Define tables to check
      const tablesToCheck = [
        "projects",
        "polar_checkouts",
        "webhook_logs",
        "customers",
      ];
      const tableResults = {};
      let atLeastOneTableExists = false;
      let existingTablesMessage = [];

      // Check each table
      for (const tableName of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(
              tableName as
                | "projects"
                | "polar_checkouts"
                | "webhook_logs"
                | "customers",
            )
            .select("id")
            .limit(1);

          // Table exists if no error or error is not about table not existing
          const exists = !error || error.code === "PGRST116";
          const count = data?.length || 0;

          tableResults[tableName] = {
            exists: exists,
            count: count,
            error: error
              ? {
                  code: error.code,
                  message: error.message,
                }
              : null,
          };

          if (exists && !error) {
            atLeastOneTableExists = true;
            existingTablesMessage.push(`${tableName} (${count} rows)`);
          }
        } catch (tableErr) {
          tableResults[tableName] = {
            exists: false,
            count: 0,
            error: {
              message: String(tableErr),
            },
          };
        }
      }

      return {
        success: atLeastOneTableExists,
        message: atLeastOneTableExists
          ? `Tables exist: ${existingTablesMessage.join(", ")}`
          : "All required tables are missing",
        details: tableResults,
      };
    } catch (err) {
      return {
        success: false,
        message: `Error checking tables: ${err instanceof Error ? err.message : String(err)}`,
        details: { error: String(err) },
      };
    }
  };

  // Test 3: Migrations Status
  const testMigrations = async () => {
    try {
      // Define tables and their expected columns
      const expectedColumns = {
        projects: [
          "id",
          "project_name",
          "developer_name",
          "description",
          "website_url",
          "x",
          "y",
          "width",
          "height",
          "color",
          "category",
        ],
        polar_checkouts: [
          "id",
          "checkout_id",
          "email",
          "status",
          "metadata",
          "created_at",
          "processed",
          "processed_at",
        ],
        webhook_logs: ["id", "created_at", "webhook_data", "processed"],
        customers: ["id", "email", "created_at", "metadata"],
      };

      // First check if tables exist at all using a more reliable method
      const tableExistenceResults = {};
      let anyTableExists = false;

      // Try to get table information from Postgres system catalogs
      const { data: tableData, error: tableError } = await supabase
        .rpc("test_insert_permission", {
          table_name: "projects",
        })
        .select("*");

      // If RPC fails, fall back to direct table checks
      if (tableError) {
        console.log("Falling back to direct table checks", tableError);
        // Check each table directly
        for (const tableName of Object.keys(expectedColumns)) {
          try {
            // Try a simple count query which is often allowed even with restrictive RLS
            const { count, error: countError } = await supabase
              .from(
                tableName as
                  | "projects"
                  | "polar_checkouts"
                  | "webhook_logs"
                  | "customers",
              )
              .select("*", { count: "exact", head: true });

            tableExistenceResults[tableName] = {
              exists: !countError || countError.code === "PGRST116",
              error: countError
                ? { code: countError.code, message: countError.message }
                : null,
            };

            if (!countError) {
              anyTableExists = true;
            }
          } catch (err) {
            tableExistenceResults[tableName] = {
              exists: false,
              error: { message: String(err) },
            };
          }
        }
      } else if (tableData) {
        // Process RPC results if available
        if (tableData && Array.isArray(tableData)) {
          tableData.forEach((item: any) => {
            if (item && typeof item === "object") {
              const tableName = item.table_name || "unknown";
              const exists = !!item.exists;
              tableExistenceResults[tableName] = {
                exists: exists,
                error: null,
              };
              if (exists) {
                anyTableExists = true;
              }
            }
          });
        }
      }

      // Collect column data for each table that exists
      const tableColumns: Record<string, string[]> = {};
      const tableErrors: Record<string, any> = {};

      // Check each table that exists
      for (const tableName of Object.keys(expectedColumns)) {
        if (tableExistenceResults[tableName]?.exists) {
          try {
            const { data, error } = await supabase
              .from(
                tableName as
                  | "projects"
                  | "polar_checkouts"
                  | "webhook_logs"
                  | "customers",
              )
              .select("*")
              .limit(1);

            if (!error && data && data.length > 0) {
              tableColumns[tableName] = Object.keys(data[0]);
            } else if (error && error.code !== "PGRST116") {
              // Store error if it's not just "table not found"
              tableErrors[tableName] = {
                code: error.code,
                message: error.message,
              };
            }
          } catch (tableErr) {
            tableErrors[tableName] = {
              message: String(tableErr),
            };
          }
        }
      }

      // Only check missing columns for tables that exist and have data
      const missingColumns: Record<string, string[]> = {};
      Object.entries(expectedColumns).forEach(([table, columns]) => {
        // Only check tables that exist in our data
        if (tableColumns[table]) {
          const existingColumns = tableColumns[table] || [];
          const missing = columns.filter(
            (col) => !existingColumns.includes(col),
          );
          if (missing.length > 0) {
            missingColumns[table] = missing;
          }
        }
      });

      // Consider success if at least one table exists and has all expected columns
      const allColumnsExistForExistingTables =
        anyTableExists &&
        Object.keys(tableColumns).every(
          (table) =>
            !missingColumns[table] || missingColumns[table].length === 0,
        );

      // Create a more detailed message about missing columns
      let missingColumnsMessage = "";
      if (Object.keys(missingColumns).length > 0) {
        missingColumnsMessage = Object.entries(missingColumns)
          .map(([table, cols]) => `${table} is missing: ${cols.join(", ")}`)
          .join("; ");
      }

      // Create a message about tables that exist but couldn't be queried
      const existingTablesWithoutColumns = Object.keys(tableExistenceResults)
        .filter(
          (table) =>
            tableExistenceResults[table]?.exists && !tableColumns[table],
        )
        .join(", ");

      let message = "";
      if (!anyTableExists) {
        message = "No tables found to check migrations";
      } else if (existingTablesWithoutColumns) {
        message = `Tables exist but couldn't query columns for: ${existingTablesWithoutColumns}. This may be due to permissions issues.`;
      } else if (allColumnsExistForExistingTables) {
        message =
          "All expected columns exist in available tables, migrations appear to be applied correctly";
      } else {
        message = `Some expected columns are missing: ${missingColumnsMessage}`;
      }

      return {
        success: allColumnsExistForExistingTables,
        message: message,
        details: {
          tableExistence: tableExistenceResults,
          tableColumns,
          missingColumns,
          tablesChecked: Object.keys(tableColumns),
          tableErrors,
        },
      };
    } catch (err) {
      return {
        success: false,
        message: `Error checking migrations: ${err instanceof Error ? err.message : String(err)}`,
        details: { error: String(err) },
      };
    }
  };

  // Test 4: Permissions Test
  const testPermissions = async () => {
    try {
      // Try to read from multiple tables to test read permissions
      const tables = [
        "projects",
        "polar_checkouts",
        "webhook_logs",
        "customers",
      ];
      const readResults = {};
      let anyReadSuccess = false;
      let successfulTables = [];

      // Test read permissions on each table
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(
              table as
                | "projects"
                | "polar_checkouts"
                | "webhook_logs"
                | "customers",
            )
            .select("id")
            .limit(1);

          // Consider PGRST116 (table not found) as not a permissions issue
          const isSuccess = !error || error.code === "PGRST116";
          readResults[table] = {
            canRead: isSuccess,
            error: error ? { code: error.code, message: error.message } : null,
          };

          if (isSuccess && !error) {
            anyReadSuccess = true;
            successfulTables.push(table);
          }
        } catch (tableErr) {
          readResults[table] = {
            canRead: false,
            error: { message: String(tableErr) },
          };
        }
      }

      // Try a simple count query which is often allowed even with restrictive RLS
      let canCount = false;
      let countError = null;

      try {
        const { data: countData, error: countErr } = await supabase
          .from("projects")
          .select("id", { count: "exact", head: true });

        canCount = !countErr || countErr.code === "PGRST116";
        countError = countErr;
      } catch (countErr) {
        canCount = false;
        countError = { message: String(countErr) };
      }

      // Try a write test on a safe table (webhook_logs)
      let canWrite = false;
      let writeError = null;

      try {
        // Only attempt insert if we have webhook_logs table
        if (readResults["webhook_logs"]?.canRead) {
          const { data: writeData, error: writeErr } = await supabase
            .from("webhook_logs")
            .insert({
              payload: { test: true },
              status: "test",
            })
            .select();

          canWrite = !writeErr;
          writeError = writeErr;
        }
      } catch (err) {
        canWrite = false;
        writeError = { message: String(err) };
      }

      // Create a more detailed message
      let permissionMessage = "";
      if (anyReadSuccess) {
        permissionMessage = `You have read permissions on: ${successfulTables.join(", ")}`;
        if (canWrite) {
          permissionMessage += "; You also have write permissions";
        }
      } else if (canCount) {
        permissionMessage =
          "You have permission to count records, but may have limited read access";
      } else {
        permissionMessage =
          "Permission issues detected - cannot read from any tables";
      }

      return {
        success: anyReadSuccess || canCount,
        message: permissionMessage,
        details: {
          readResults,
          countPermission: {
            canCount,
            error: countError
              ? { code: countError.code, message: countError.message }
              : null,
          },
          writePermission: {
            canWrite,
            error: writeError,
          },
        },
      };
    } catch (err) {
      return {
        success: false,
        message: `Error testing permissions: ${err instanceof Error ? err.message : String(err)}`,
        details: { error: String(err) },
      };
    }
  };

  const getOverallStatus = () => {
    if (!results) return null;

    const tests = [
      results.connectionTest,
      results.tablesTest,
      results.migrationsTest,
      results.permissionsTest,
    ];
    const allSuccess = tests.every((test) => test.success);
    const anySuccess = tests.some((test) => test.success);

    if (allSuccess) {
      return {
        status: "success",
        message:
          "All tests passed! Your Supabase connection is working correctly.",
      };
    } else if (anySuccess) {
      return {
        status: "warning",
        message:
          "Some tests passed, but there are issues that need to be addressed.",
      };
    } else {
      return {
        status: "error",
        message:
          "All tests failed. There are serious issues with your Supabase connection.",
      };
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-purple-400 flex items-center gap-2">
            <Database className="h-5 w-5" /> Supabase Connection Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2 text-sm text-gray-400 bg-gray-800/50 p-3 rounded-md">
              <h3 className="font-medium text-white mb-2 flex items-center gap-1">
                <Server className="h-4 w-4" /> Connection Details
              </h3>
              <p>
                <span className="font-medium">Supabase URL:</span>{" "}
                {maskString(supabaseUrl)}
              </p>
              <p>
                <span className="font-medium">Anon Key:</span>{" "}
                {maskString(supabaseAnonKey)}
              </p>
              <p>
                <span className="font-medium">Project ID:</span>{" "}
                {maskString(supabaseProjectId)}
              </p>
              <p>
                <span className="font-medium">Service Key:</span>{" "}
                {maskString(supabaseServiceKey)}
              </p>
            </div>

            <div className="flex flex-col justify-between bg-gray-800/50 p-3 rounded-md">
              <div className="text-sm text-gray-400 mb-4">
                <h3 className="font-medium text-white mb-2 flex items-center gap-1">
                  <Key className="h-4 w-4" /> Diagnostic Tools
                </h3>
                <p>
                  Run comprehensive tests to diagnose database connection
                  issues.
                </p>
              </div>

              <Button
                onClick={runAllTests}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run All Diagnostic Tests
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert className="bg-red-900/30 border-red-800">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {overallStatus && (
            <Alert
              className={`${
                overallStatus.status === "success"
                  ? "bg-green-900/30 border-green-800"
                  : overallStatus.status === "warning"
                    ? "bg-amber-900/30 border-amber-800"
                    : "bg-red-900/30 border-red-800"
              }`}
            >
              {overallStatus.status === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : overallStatus.status === "warning" ? (
                <AlertCircle className="h-4 w-4 text-amber-400" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-400" />
              )}
              <AlertTitle
                className={`${
                  overallStatus.status === "success"
                    ? "text-green-400"
                    : overallStatus.status === "warning"
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {overallStatus.status === "success"
                  ? "All Tests Passed"
                  : overallStatus.status === "warning"
                    ? "Some Tests Passed"
                    : "Tests Failed"}
              </AlertTitle>
              <AlertDescription>{overallStatus.message}</AlertDescription>
            </Alert>
          )}

          {results && (
            <Tabs defaultValue="connection" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger
                  value="connection"
                  className={
                    results.connectionTest.success
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  Connection
                </TabsTrigger>
                <TabsTrigger
                  value="tables"
                  className={
                    results.tablesTest.success
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  Tables
                </TabsTrigger>
                <TabsTrigger
                  value="migrations"
                  className={
                    results.migrationsTest.success
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  Migrations
                </TabsTrigger>
                <TabsTrigger
                  value="permissions"
                  className={
                    results.permissionsTest.success
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  Permissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="connection" className="space-y-4">
                <Alert
                  className={
                    results.connectionTest.success
                      ? "bg-green-900/30 border-green-800"
                      : "bg-red-900/30 border-red-800"
                  }
                >
                  {results.connectionTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      results.connectionTest.success
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {results.connectionTest.success
                      ? "Connection Successful"
                      : "Connection Failed"}
                  </AlertTitle>
                  <AlertDescription>
                    {results.connectionTest.message}
                  </AlertDescription>
                </Alert>

                {results.connectionTest.details && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details" className="border-gray-800">
                      <AccordionTrigger className="text-gray-400 hover:text-white">
                        View Details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-800/50 p-3 rounded-md text-xs overflow-auto max-h-60">
                          <pre className="text-gray-300">
                            {JSON.stringify(
                              results.connectionTest.details,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <div className="space-y-2 text-sm">
                  <h3 className="font-medium text-white">
                    Troubleshooting Tips:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Verify that your Supabase URL is correct</li>
                    <li>
                      Check that your Anon Key has the necessary permissions
                    </li>
                    <li>Ensure your Supabase project is active and running</li>
                    <li>Check for network issues or firewall restrictions</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="tables" className="space-y-4">
                <Alert
                  className={
                    results.tablesTest.success
                      ? "bg-green-900/30 border-green-800"
                      : "bg-red-900/30 border-red-800"
                  }
                >
                  {results.tablesTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      results.tablesTest.success
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {results.tablesTest.success
                      ? "Tables Exist"
                      : "Tables Missing"}
                  </AlertTitle>
                  <AlertDescription>
                    {results.tablesTest.message}
                  </AlertDescription>
                </Alert>

                {results.tablesTest.details && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details" className="border-gray-800">
                      <AccordionTrigger className="text-gray-400 hover:text-white">
                        View Details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-800/50 p-3 rounded-md text-xs overflow-auto max-h-60">
                          <pre className="text-gray-300">
                            {JSON.stringify(
                              results.tablesTest.details,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <div className="space-y-2 text-sm">
                  <h3 className="font-medium text-white">
                    Troubleshooting Tips:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Run migrations to create missing tables</li>
                    <li>Check if you're connecting to the correct database</li>
                    <li>
                      Verify that your Anon Key has access to these tables
                    </li>
                    <li>
                      Check for Row Level Security (RLS) policies that might be
                      restricting access
                    </li>
                    <li>
                      Run the following SQL in the Supabase SQL Editor to create
                      missing tables:
                      <div className="bg-gray-800 p-2 mt-1 rounded text-xs overflow-x-auto">
                        <code>
                          CREATE TABLE IF NOT EXISTS projects (id uuid PRIMARY
                          KEY DEFAULT uuid_generate_v4(), project_name TEXT,
                          developer_name TEXT, description TEXT, website_url
                          TEXT, x INTEGER, y INTEGER, width INTEGER, height
                          INTEGER, color TEXT, category TEXT);
                        </code>
                      </div>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="migrations" className="space-y-4">
                <Alert
                  className={
                    results.migrationsTest.success
                      ? "bg-green-900/30 border-green-800"
                      : "bg-red-900/30 border-red-800"
                  }
                >
                  {results.migrationsTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      results.migrationsTest.success
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {results.migrationsTest.success
                      ? "Migrations Applied"
                      : "Migrations Issue"}
                  </AlertTitle>
                  <AlertDescription>
                    {results.migrationsTest.message}
                  </AlertDescription>
                </Alert>

                {results.migrationsTest.details && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details" className="border-gray-800">
                      <AccordionTrigger className="text-gray-400 hover:text-white">
                        View Details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-800/50 p-3 rounded-md text-xs overflow-auto max-h-60">
                          <pre className="text-gray-300">
                            {JSON.stringify(
                              results.migrationsTest.details,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <div className="space-y-2 text-sm">
                  <h3 className="font-medium text-white">
                    Troubleshooting Tips:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>Run all migrations in the correct order</li>
                    <li>Check for migration errors in the console</li>
                    <li>
                      Verify that all migration files are properly formatted
                    </li>
                    <li>
                      Consider running a fresh migration if the schema is
                      significantly out of sync
                    </li>
                    <li>
                      Check the migration files in the supabase/migrations
                      folder
                    </li>
                    <li>
                      Run the following SQL in the Supabase SQL Editor to add
                      missing columns:
                      <div className="bg-gray-800 p-2 mt-1 rounded text-xs overflow-x-auto">
                        <code>
                          ALTER TABLE projects ADD COLUMN IF NOT EXISTS category
                          TEXT;
                        </code>
                      </div>
                    </li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <Alert
                  className={
                    results.permissionsTest.success
                      ? "bg-green-900/30 border-green-800"
                      : "bg-red-900/30 border-red-800"
                  }
                >
                  {results.permissionsTest.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertTitle
                    className={
                      results.permissionsTest.success
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {results.permissionsTest.success
                      ? "Permissions OK"
                      : "Permission Issues"}
                  </AlertTitle>
                  <AlertDescription>
                    {results.permissionsTest.message}
                  </AlertDescription>
                </Alert>

                {results.permissionsTest.details && (
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="details" className="border-gray-800">
                      <AccordionTrigger className="text-gray-400 hover:text-white">
                        View Details
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-gray-800/50 p-3 rounded-md text-xs overflow-auto max-h-60">
                          <pre className="text-gray-300">
                            {JSON.stringify(
                              results.permissionsTest.details,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <div className="space-y-2 text-sm">
                  <h3 className="font-medium text-white">
                    Troubleshooting Tips:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    <li>
                      Check Row Level Security (RLS) policies for your tables
                    </li>
                    <li>
                      Verify that your Anon Key has the necessary permissions
                    </li>
                    <li>
                      Consider temporarily disabling RLS for testing purposes
                    </li>
                    <li>
                      Check if you need to be authenticated to access certain
                      tables
                    </li>
                    <li>
                      Run the following SQL in the Supabase SQL Editor to
                      disable RLS for testing:
                      <div className="bg-gray-800 p-2 mt-1 rounded text-xs overflow-x-auto">
                        <code>
                          ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
                        </code>
                      </div>
                    </li>
                    <li>
                      Or create a policy that allows anonymous access:
                      <div className="bg-gray-800 p-2 mt-1 rounded text-xs overflow-x-auto">
                        <code>
                          CREATE POLICY "Allow anonymous access" ON projects FOR
                          ALL USING (true);
                        </code>
                      </div>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseConnectionChecker;
