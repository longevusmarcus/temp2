import { createClient } from "@supabase/supabase-js";
import { PurchaseData } from "./types";
import { Database } from "@/types/supabase";

// Use the provided project URL or fall back to env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Create the client with the required values
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// This function would be called by a webhook handler when a payment is successful
export const handleSuccessfulPayment = async (sessionData: any) => {
  // Verify payment status is successful before proceeding
  if (
    !sessionData ||
    (sessionData.status !== "completed" && sessionData.status !== "succeeded")
  ) {
    console.error("Payment not successful, aborting project creation");
    return false;
  }
  try {
    // Extract purchase data from the session metadata
    const metadata = sessionData.metadata || {};
    const purchaseData: PurchaseData = {
      blockSize: metadata.blockSize || "medium",
      locations: JSON.parse(metadata.locations || "[]"),
      projectDetails: {
        projectName: metadata.projectName || "",
        developerName: metadata.developerName || "",
        description: metadata.description || "",
        websiteUrl: metadata.websiteUrl || "",
        thumbnail: null,
        category: metadata.category || "",
        email: metadata.email || "",
      },
    };

    // For each location, create a project entry in the database
    for (const location of purchaseData.locations) {
      const { data, error } = await supabase.from("projects").insert({
        project_name: purchaseData.projectDetails.projectName,
        developer_name: purchaseData.projectDetails.developerName,
        description: purchaseData.projectDetails.description,
        website_url: purchaseData.projectDetails.websiteUrl,
        x: location.x,
        y: location.y,
        width:
          purchaseData.blockSize === "small"
            ? 10
            : purchaseData.blockSize === "medium"
              ? 20
              : 50,
        height:
          purchaseData.blockSize === "small"
            ? 10
            : purchaseData.blockSize === "medium"
              ? 20
              : 50,
        color: getRandomColor(),
        category: purchaseData.projectDetails.category,
        email: purchaseData.projectDetails.email,
      });

      if (error) {
        console.error("Error saving project to database:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error handling successful payment:", error);
    return false;
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
