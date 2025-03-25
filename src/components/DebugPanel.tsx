import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  RefreshCw,
  Search,
  Mail,
  ExternalLink,
  MapPin,
  Trash2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { createClient } from "@supabase/supabase-js";
import { testPolarApi } from "@/lib/polar";
import { PixelBlock } from "@/lib/types";
import DeployFunctionsPanel from "./DeployFunctionsPanel";

const DebugPanel = () => {
  const { fetchStats, findBlocksByEmail } = useStore();
  const [checkoutId, setCheckoutId] = useState("");
  const [email, setEmail] = useState("longevusmarcus@gmail.com");
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polarExternalId, setPolarExternalId] = useState("customer_1234");
  const [polarAccessToken, setPolarAccessToken] = useState("");
  const [polarResult, setPolarResult] = useState<any>(null);
  const [polarLoading, setPolarLoading] = useState(false);
  const [polarError, setPolarError] = useState<string | null>(null);
  const [foundPixels, setFoundPixels] = useState<PixelBlock[]>([]);
  const [pixelSearchLoading, setPixelSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState("");

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  // Log Supabase configuration in DebugPanel
  const maskedKey = supabaseAnonKey
    ? `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}`
    : "undefined";
  console.log("DebugPanel Supabase Config:", {
    url: supabaseUrl || "undefined",
    anonKey: maskedKey,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
  });

  // Create client with better error handling
  const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  const handleRefreshGrid = async () => {
    setIsLoading(true);
    try {
      await fetchStats();
      setError(null);
    } catch (err) {
      setError("Failed to refresh grid data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutLookup = async () => {
    if (!checkoutId) return;

    setIsLoading(true);
    setError(null);
    setCheckoutData(null);
    setCheckouts([]);

    try {
      // Look up the checkout in the database
      const { data, error } = await supabase
        .from("polar_checkouts")
        .select("*")
        .eq("checkout_id", checkoutId)
        .single();

      if (error) throw error;

      if (data) {
        setCheckoutData(data);
      } else {
        setError("Checkout not found");
      }
    } catch (err) {
      console.error("Error looking up checkout:", err);
      setError("Error looking up checkout");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLookup = async () => {
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setCheckoutData(null);
    setCheckouts([]);

    try {
      // Look up checkouts by email
      const { data, error } = await supabase
        .from("polar_checkouts")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCheckouts(data);
        // Auto-select the first checkout
        setCheckoutData(data[0]);
      } else {
        // If no checkouts found, check projects table directly
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .ilike("developer_name", `%${email}%`);

        if (projectsError) throw projectsError;

        if (projectsData && projectsData.length > 0) {
          setError(
            `No checkouts found, but found ${projectsData.length} projects that might be yours. Check the grid for your pixels.`,
          );
          console.log("Projects found:", projectsData);
        } else {
          setError("No checkouts or projects found for this email");
        }
      }
    } catch (err) {
      console.error("Error looking up checkouts by email:", err);
      setError("Error looking up checkouts");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualInsert = async () => {
    if (!checkoutData) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract data from the checkout
      const metadata = checkoutData.metadata || {};
      const blockSize = metadata.blockSize || "medium";
      const locations = Array.isArray(metadata.locations)
        ? metadata.locations
        : JSON.parse(metadata.locations || "[]");

      // Get block dimensions
      const dimensions = getBlockDimensions(blockSize);

      // Insert projects for each location
      for (const location of locations) {
        const { error } = await supabase.from("projects").insert({
          project_name: metadata.projectName || "Unnamed Project",
          developer_name: metadata.developerName || "Anonymous",
          description: metadata.description || "",
          website_url: metadata.websiteUrl || "",
          x: location.x,
          y: location.y,
          width: dimensions.width,
          height: dimensions.height,
          color: getRandomColor(),
          category: metadata.category || "",
        });

        if (error) throw error;
      }

      // Mark checkout as processed
      await supabase
        .from("polar_checkouts")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("checkout_id", checkoutData.checkout_id);

      // Refresh the grid
      await fetchStats();

      setError(null);
      alert("Successfully added projects to the grid!");
    } catch (err) {
      console.error("Error manually inserting projects:", err);
      setError("Error manually inserting projects");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for random color generation
  function getRandomColor(): string {
    const colors = [
      "#ff5588",
      "#5588ff",
      "#44cc88",
      "#ffaa22",
      "#33ccff",
      "#ff33cc",
      "#cc33ff",
      "#33ffcc",
      "#ffcc33",
      "#3366ff",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Get block dimensions based on size
  function getBlockDimensions(blockSize: string): {
    width: number;
    height: number;
  } {
    switch (blockSize) {
      case "small":
        return { width: 10, height: 10 };
      case "medium":
        return { width: 20, height: 20 };
      case "large":
        return { width: 50, height: 50 };
      default:
        return { width: 20, height: 20 }; // Default to medium
    }
  }

  // Handle Polar API test
  const handlePolarApiTest = async () => {
    if (!polarExternalId) return;

    setPolarLoading(true);
    setPolarError(null);
    setPolarResult(null);

    try {
      // Create a custom Polar instance with the provided token if available
      let result;
      if (polarAccessToken) {
        // Import Polar SDK directly to create a custom instance
        const { Polar } = await import("@polar-sh/sdk");
        const customPolar = new Polar({
          accessToken: polarAccessToken,
        });

        // Call the API directly with the custom instance
        result = await customPolar.customers.getStateExternal({
          externalId: polarExternalId,
        });
      } else {
        // Use the default testPolarApi function
        result = await testPolarApi(polarExternalId);
      }

      setPolarResult(result);
    } catch (err: any) {
      console.error("Polar API test error:", err);
      // Extract more detailed error information
      let errorMessage = "Error testing Polar API";

      if (err.response) {
        // Handle API response errors
        errorMessage = `API error occurred: Status ${err.response.status} ${err.response.statusText || ""}`;
        if (err.response.data) {
          errorMessage += ` - ${JSON.stringify(err.response.data)}`;
        }
      } else if (err.error) {
        // Handle error object with error and detail properties (common in Polar API responses)
        errorMessage = `API error occurred: ${err.error}`;
        if (err.detail) {
          errorMessage += ` - ${err.detail}`;
        }

        // Special handling for ResourceNotFound error
        if (err.error === "ResourceNotFound") {
          errorMessage = `Customer ID not found: The external ID "${polarExternalId}" does not exist in the Polar system. Please verify the ID is correct.`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setPolarError(errorMessage);
    } finally {
      setPolarLoading(false);
    }
  };

  // Find pixels directly by email
  const handleFindPixels = async () => {
    if (!email) return;

    setPixelSearchLoading(true);
    setFoundPixels([]);
    setError(null);

    try {
      // Check if the database is accessible and has tables
      const { data: tableInfo, error: tableError } = await supabase
        .from("projects")
        .select("count(*)", { count: "exact", head: true });

      if (tableError) {
        console.error("Database connection or table error:", tableError);
        setError(
          `Database error: ${tableError.message}. Please check your Supabase connection.`,
        );
        return;
      }

      // First try the normal search
      const pixels = await findBlocksByEmail(email);

      // If no results, try a direct database query with more debug info
      if (pixels.length === 0) {
        console.log(
          "No pixels found with findBlocksByEmail, trying direct query...",
        );

        // Try to find any projects in the database
        const { data: allProjects, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .limit(5);

        if (projectsError) {
          console.error("Error fetching all projects:", projectsError);
          setError(
            `Database query error: ${projectsError.message}. Please check your Supabase permissions.`,
          );
          return;
        }

        console.log(
          `Found ${allProjects?.length || 0} total projects in database`,
        );

        if (allProjects && allProjects.length > 0) {
          // Show the first few projects to debug
          console.log("Sample projects:", allProjects.slice(0, 2));

          // Display sample project data in the UI for debugging
          setError(
            `No pixels found for your email, but there are ${allProjects.length} projects in the database. ` +
              `Sample project: ${allProjects[0].project_name} by ${allProjects[0].developer_name}. ` +
              `Try a different email or check console for more details.`,
          );

          // Try a more flexible search
          const { data: flexibleSearch, error: flexError } = await supabase
            .from("projects")
            .select("*")
            .or(
              `developer_name.ilike.%${email}%,project_name.ilike.%${email.split("@")[0]}%,developer_name.eq.${email}`,
            );

          if (flexError) {
            console.error("Error with flexible search:", flexError);
          } else if (flexibleSearch && flexibleSearch.length > 0) {
            // Convert to PixelBlock format
            const foundBlocks = flexibleSearch.map((project) => ({
              id: project.id.toString(),
              x: project.x || 0,
              y: project.y || 0,
              width: project.width || 0,
              height: project.height || 0,
              projectName: project.project_name || "",
              developerName: project.developer_name || "",
              description: project.description || "",
              thumbnailUrl: project.thumbnail_url || "",
              websiteUrl: project.website_url || "",
              color: project.color || getRandomColor(),
              category: project.category || "",
            }));

            setFoundPixels(foundBlocks);
            setError(null); // Clear error since we found pixels
            console.log("Found pixels with flexible search:", foundBlocks);
            return;
          }
        } else {
          // Try to check if the table exists but is empty
          const { count, error: countError } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true });

          if (countError) {
            console.error("Error counting projects:", countError);
            setError(
              "Database error while counting projects. Please check your Supabase connection and permissions.",
            );
          } else {
            console.log("Project count from exact count:", count);
            setError(
              `No projects found in the database at all. The database appears to be empty. ` +
                `Count result: ${count}. Please check if data has been inserted correctly.`,
            );
          }
          return;
        }
      } else {
        setFoundPixels(pixels);
        return;
      }

      setError(
        "No pixels found for this email. Try checking if you used a different email or if your purchase was completed.",
      );
    } catch (err) {
      console.error("Error finding pixels:", err);
      setError(
        "Error finding pixels: " +
          (err instanceof Error ? err.message : String(err)) +
          ". Check the console for more details.",
      );
    } finally {
      setPixelSearchLoading(false);
    }
  };

  // Handle deleting a specific project by ID
  const handleDeleteProject = async () => {
    if (!projectIdToDelete) return;

    setDeleteLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectIdToDelete);

      if (error) throw error;

      // Refresh the grid and pixel search
      await fetchStats();
      if (email) {
        await handleFindPixels();
      }

      setError(`Successfully deleted project with ID: ${projectIdToDelete}`);
      setProjectIdToDelete("");
    } catch (err) {
      console.error("Error deleting project:", err);
      setError(
        `Error deleting project: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle deleting all projects
  const handleDeleteAllProjects = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL projects? This cannot be undone!",
      )
    ) {
      return;
    }

    setDeleteLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("projects").delete().neq("id", 0); // This will delete all projects

      if (error) throw error;

      // Refresh the grid and pixel search
      await fetchStats();
      setFoundPixels([]);

      setError("Successfully deleted all projects");
    } catch (err) {
      console.error("Error deleting all projects:", err);
      setError(
        `Error deleting all projects: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Auto-lookup the email when component mounts
  useEffect(() => {
    if (email) {
      handleEmailLookup();
      handleFindPixels();
    }
  }, []);

  // Add a function to check database connection
  const checkDatabaseConnection = async () => {
    setIsLoading(true);
    setError(null);
    console.log("Starting database connection check...");

    try {
      // First, check if Supabase URL and key are available
      console.log("Checking Supabase credentials...");
      console.log("Supabase URL:", supabaseUrl ? "Set" : "Not set");
      console.log("Supabase Anon Key:", supabaseAnonKey ? "Set" : "Not set");

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Supabase credentials missing");
        setError(
          `Supabase configuration error: ${!supabaseUrl ? "URL" : "Anon Key"} is missing. ` +
            `Please check your environment variables. ` +
            `VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.`,
        );
        return;
      }

      // Test if we can connect to Supabase at all
      try {
        // Using try/catch instead of .catch() method which isn't available on the Promise returned by Supabase
        const { data: healthData, error: healthError } = await supabase
          .from("health_check")
          .select("*")
          .limit(1);

        // If we get here, connection works even if there's an error (expected since health_check table likely doesn't exist)
        console.log(
          "Health check result:",
          healthError ? "Error but expected" : "Success",
        );
      } catch (healthErr) {
        console.error("Critical connection error:", healthErr);
        setError(
          `Critical Supabase connection error: ${healthErr instanceof Error ? healthErr.message : String(healthErr)}. ` +
            `This suggests the Supabase URL may be incorrect or the service is unreachable.`,
        );
        return;
      }

      // Test basic connection to projects table with detailed error logging
      console.log("Testing connection to projects table...");
      const projectsResult = await supabase
        .from("projects")
        .select("count(*)", { count: "exact", head: true });

      const { data, error } = projectsResult;

      // Log the full response for debugging
      console.log("Projects table response:", projectsResult);

      if (error) {
        // Log detailed error information
        console.error("Database connection error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        console.error("Database connection error:", error);

        // Provide more specific error messages based on error code
        if (error.code === "PGRST116") {
          setError(
            `Table 'projects' not found. The database schema may not be set up correctly. ` +
              `Please check if migrations have been run.`,
          );
        } else if (error.code === "PGRST301") {
          setError(
            `Permission denied: Your Supabase Anon Key doesn't have access to the 'projects' table. ` +
              `Please check your Row Level Security (RLS) policies.`,
          );
        } else {
          // Provide a more detailed error message
          const errorDetails = [
            `Database connection error: ${error.message}`,
            error.code ? `(Code: ${error.code})` : "",
            error.details ? `Details: ${error.details}` : "",
            error.hint ? `Hint: ${error.hint}` : "",
          ]
            .filter(Boolean)
            .join("\n");

          setError(
            `${errorDetails}\n\nPlease check your Supabase configuration and ensure your database is properly set up.\nYou may need to run migrations or check your environment variables.`,
          );
        }
        return;
      }

      // Try to list all tables to check schema access
      let tableList = null;
      let tableListError = null;
      try {
        const result = await supabase
          .from("pg_tables")
          .select("schemaname,tablename")
          .eq("schemaname", "public");
        tableList = result.data;
        tableListError = result.error;
      } catch (err) {
        tableListError = {
          message: "Cannot list tables, insufficient permissions",
        };
      }

      if (tableListError) {
        console.log(
          "Table list check (may fail with limited permissions):",
          tableListError,
        );
      } else {
        console.log("Available tables:", tableList);
      }

      // Try to get a few rows to check permissions
      const { data: sampleRows, error: rowsError } = await supabase
        .from("projects")
        .select("*")
        .limit(1);

      if (rowsError) {
        console.error("Error fetching sample rows:", rowsError);
        setError(
          `Database read error: ${rowsError.message}. You may not have permission to read from the projects table.`,
        );
        return;
      }

      // Check if we can access other important tables
      let checkoutData = null;
      let checkoutError = null;
      try {
        const result = await supabase
          .from("polar_checkouts")
          .select("count(*)", { count: "exact", head: true });
        checkoutData = result.data;
        checkoutError = result.error;
      } catch (err) {
        checkoutError = { message: "Cannot access polar_checkouts table" };
      }

      setError(
        `Database connection successful! Found ${data && typeof data === "object" && "count" in data ? data.count : 0} projects in the database. ` +
          `${sampleRows?.length ? "Sample data retrieved successfully." : "No sample data available."} ` +
          `${checkoutError ? "Could not access checkout data." : `Found ${checkoutData && typeof checkoutData === "object" && "count" in checkoutData ? checkoutData.count : 0} checkout records.`}`,
      );

      console.log("Database connection test results:", {
        count:
          data && typeof data === "object" && "count" in data ? data.count : 0,
        sampleRows,
        checkouts:
          checkoutData &&
          typeof checkoutData === "object" &&
          "count" in checkoutData
            ? checkoutData.count
            : 0,
        tables: tableList,
      });
    } catch (err) {
      console.error("Unexpected error during database check:", err);
      setError(
        `Unexpected error during database check: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DeployFunctionsPanel />

      <Card className="w-full bg-gray-900 border-gray-800 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-purple-400">
            Debug Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button
              onClick={checkDatabaseConnection}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 mb-2"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Check Database Connection
            </Button>
            <div className="mt-2 text-xs text-gray-400">
              <p>
                Supabase URL:{" "}
                {supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : "Not set"}
              </p>
              <p>
                Anon Key:{" "}
                {supabaseAnonKey
                  ? `${supabaseAnonKey.substring(0, 5)}...`
                  : "Not set"}
              </p>
            </div>
          </div>
          <div>
            <Button
              onClick={handleRefreshGrid}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Force Refresh Grid Data
            </Button>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Lookup Checkout by ID</p>
            <div className="flex space-x-2">
              <Input
                value={checkoutId}
                onChange={(e) => setCheckoutId(e.target.value)}
                placeholder="Enter checkout ID"
                className="bg-gray-800 border-gray-700"
              />
              <Button
                onClick={handleCheckoutLookup}
                disabled={isLoading || !checkoutId}
                size="icon"
                variant="secondary"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">
              Lookup Checkouts by Email
            </p>
            <div className="flex space-x-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="bg-gray-800 border-gray-700"
              />
              <Button
                onClick={handleEmailLookup}
                disabled={isLoading || !email}
                size="icon"
                variant="secondary"
              >
                <Mail className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleFindPixels}
                disabled={pixelSearchLoading || !email}
                size="icon"
                variant="secondary"
                className="bg-purple-700 hover:bg-purple-800"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-900/30 border border-red-800 rounded text-sm text-red-300">
              {error}
            </div>
          )}

          {checkouts.length > 0 && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-md">
                <h4 className="font-medium text-purple-300 mb-2">
                  Found Checkouts
                </h4>
                <div className="space-y-2">
                  {checkouts.map((checkout) => (
                    <div
                      key={checkout.checkout_id}
                      className={`p-2 rounded cursor-pointer text-xs ${checkoutData?.checkout_id === checkout.checkout_id ? "bg-purple-900/30 border border-purple-700" : "bg-gray-700 hover:bg-gray-600"}`}
                      onClick={() => setCheckoutData(checkout)}
                    >
                      <p>
                        <span className="text-gray-400">ID:</span>{" "}
                        {checkout.checkout_id}
                      </p>
                      <p>
                        <span className="text-gray-400">Created:</span>{" "}
                        {new Date(checkout.created_at).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-gray-400">Status:</span>{" "}
                        {checkout.status}{" "}
                        {checkout.processed ? "(Processed)" : "(Not Processed)"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {checkoutData && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded-md">
                <h4 className="font-medium text-purple-300 mb-1">
                  Checkout Details
                </h4>
                <div className="text-xs text-gray-300 space-y-1">
                  <p>
                    <span className="text-gray-400">ID:</span>{" "}
                    {checkoutData.checkout_id}
                  </p>
                  <p>
                    <span className="text-gray-400">Email:</span>{" "}
                    {checkoutData.email}
                  </p>
                  <p>
                    <span className="text-gray-400">Status:</span>{" "}
                    {checkoutData.status}
                  </p>
                  <p>
                    <span className="text-gray-400">Processed:</span>{" "}
                    {checkoutData.processed ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="text-gray-400">Created:</span>{" "}
                    {new Date(checkoutData.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {checkoutData.metadata && (
                <div className="p-3 bg-gray-800 rounded-md">
                  <h4 className="font-medium text-purple-300 mb-1">Metadata</h4>
                  <div className="text-xs text-gray-300 space-y-1">
                    <p>
                      <span className="text-gray-400">Project:</span>{" "}
                      {checkoutData.metadata.projectName}
                    </p>
                    <p>
                      <span className="text-gray-400">Developer:</span>{" "}
                      {checkoutData.metadata.developerName}
                    </p>
                    <p>
                      <span className="text-gray-400">Block Size:</span>{" "}
                      {checkoutData.metadata.blockSize}
                    </p>
                    <p>
                      <span className="text-gray-400">Locations:</span>{" "}
                      {typeof checkoutData.metadata.locations === "string"
                        ? checkoutData.metadata.locations
                        : JSON.stringify(checkoutData.metadata.locations)}
                    </p>
                  </div>
                </div>
              )}

              {!checkoutData.processed && (
                <Button
                  onClick={handleManualInsert}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Manually Insert Projects
                </Button>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Test Polar API</p>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={polarExternalId}
                  onChange={(e) => setPolarExternalId(e.target.value)}
                  placeholder="Enter external customer ID"
                  className="bg-gray-800 border-gray-700"
                />
                <Button
                  onClick={handlePolarApiTest}
                  disabled={polarLoading || !polarExternalId}
                  size="icon"
                  variant="secondary"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Input
                  value={polarAccessToken}
                  onChange={(e) => setPolarAccessToken(e.target.value)}
                  placeholder="Custom Polar access token (optional)"
                  className="bg-gray-800 border-gray-700"
                  type="password"
                />
                <div className="text-xs text-gray-500 flex items-center">
                  {polarAccessToken
                    ? "Custom token set"
                    : "Using default token"}
                  <span className="ml-2 text-amber-500">
                    (ResourceNotFound errors indicate an invalid or non-existent
                    customer ID)
                  </span>
                </div>
              </div>
            </div>

            {polarError && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded text-sm text-red-300">
                {polarError}
              </div>
            )}

            {polarResult && (
              <div className="mt-2 p-3 bg-gray-800 rounded-md">
                <h4 className="font-medium text-purple-300 mb-1">
                  Polar API Result
                </h4>
                <div className="text-xs text-gray-300 overflow-auto max-h-40">
                  <pre>{JSON.stringify(polarResult, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Delete Projects</p>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={projectIdToDelete}
                  onChange={(e) => setProjectIdToDelete(e.target.value)}
                  placeholder="Enter project ID to delete"
                  className="bg-gray-800 border-gray-700"
                />
                <Button
                  onClick={handleDeleteProject}
                  disabled={deleteLoading || !projectIdToDelete}
                  size="icon"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={handleDeleteAllProjects}
                disabled={deleteLoading}
                variant="destructive"
                className="w-full"
              >
                {deleteLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete ALL Projects
              </Button>
              <p className="text-xs text-red-400 mt-1">
                Warning: This will permanently delete all projects from the
                database.
              </p>
            </div>
          </div>

          {foundPixels.length > 0 && (
            <div className="pt-2 border-t border-gray-700 mt-4">
              <h4 className="font-medium text-purple-300 mb-2">
                Your Pixels ({foundPixels.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-auto">
                {foundPixels.map((pixel) => (
                  <div
                    key={pixel.id}
                    className="p-3 bg-gray-800 rounded-md border border-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{ backgroundColor: pixel.color }}
                      />
                      <span className="font-medium text-white">
                        {pixel.projectName}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        ID: {pixel.id}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 space-y-1">
                      <p>
                        <span className="text-gray-400">Position:</span> x:
                        {pixel.x}, y:{pixel.y}
                      </p>
                      <p>
                        <span className="text-gray-400">Size:</span>{" "}
                        {pixel.width}×{pixel.height}
                      </p>
                      <p>
                        <span className="text-gray-400">Developer:</span>{" "}
                        {pixel.developerName}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        {pixel.websiteUrl && (
                          <a
                            href={pixel.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                          >
                            Visit <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        <Button
                          onClick={() => {
                            setProjectIdToDelete(pixel.id.toString());
                            handleDeleteProject();
                          }}
                          size="sm"
                          variant="destructive"
                          className="h-6 text-xs"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPanel;
