import { create } from "zustand";
import { supabase } from "./supabase-client-fixed";
import { PixelBlock, PurchaseData, BLOCK_SIZES } from "./types";

interface StoreState {
  isLoading: boolean;
  isFetchingStats: boolean;
  pixelBlocks: PixelBlock[];
  purchasedPixels: number;
  availablePixels: number;
  totalPixels: number;
  totalProjects: number;
  fetchPixelBlocks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  addBlock: (purchaseData: PurchaseData) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  isLoading: false,
  isFetchingStats: false,
  pixelBlocks: [],
  purchasedPixels: 0,
  availablePixels: 1000000, // Default to 1 million pixels
  totalPixels: 1000000, // Default to 1 million pixels
  totalProjects: 0,

  fetchPixelBlocks: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pixel blocks:", error);
        throw error;
      }

      console.log("Fetched projects data:", data);

      // Transform the data to match our PixelBlock type
      const blocks: PixelBlock[] = data.map((item) => ({
        id: item.id,
        projectName: item.project_name,
        developerName: item.developer_name,
        description: item.description,
        websiteUrl: item.website_url,
        thumbnailUrl: item.thumbnail_url || "", // Ensure thumbnailUrl is set from thumbnail_url
        thumbnail_url: item.thumbnail_url || "", // Also keep the original field name for compatibility
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        color: item.color || "#6d28d9", // Default to purple if no color
        category: item.category || "Other",
        email: item.email || "",
      }));

      set({ pixelBlocks: blocks, isLoading: false });
    } catch (error) {
      console.error("Error fetching pixel blocks:", error);
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    // Enhanced guard to prevent multiple simultaneous fetches
    if (get().isFetchingStats) {
      console.log("Stats fetch already in progress, skipping...");
      return;
    }

    set({ isFetchingStats: true });
    console.log("Starting to fetch stats from Supabase...");
    try {
      // First, try to fetch all projects to see if we can access the data
      const { data: allProjects, error: allProjectsError } = await supabase
        .from("projects")
        .select("*");

      if (allProjectsError) {
        console.error("Error fetching all projects:", allProjectsError);
        throw allProjectsError;
      }

      console.log("All projects data:", allProjects);

      // If we can get the data, use it directly instead of count
      const projectCount = allProjects.length;
      console.log("Project count from data:", projectCount);

      // Calculate total pixels manually from the data we already have
      const purchasedPixels = allProjects.reduce(
        (sum, item) => sum + item.width * item.height,
        0,
      );
      const totalPixels = 1000000; // 1000x1000 grid
      const availablePixels = totalPixels - purchasedPixels;

      console.log("Calculated stats from fetched data:", {
        totalProjects: projectCount,
        purchasedPixels,
        availablePixels,
        totalPixels,
      });

      set({
        totalProjects: projectCount,
        purchasedPixels,
        availablePixels,
        totalPixels,
        isFetchingStats: false,
        // Also update the pixel blocks directly since we already have the data
        pixelBlocks: allProjects.map((item) => ({
          id: item.id,
          projectName: item.project_name,
          developerName: item.developer_name,
          description: item.description,
          websiteUrl: item.website_url,
          thumbnailUrl: item.thumbnail_url || "",
          thumbnail_url: item.thumbnail_url || "",
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          color: item.color || "#6d28d9",
          category: item.category || "Other",
          email: item.email || "",
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      set({ isFetchingStats: false });
    }
  },

  addBlock: (purchaseData: PurchaseData) => {
    // Extract the first location from the locations array
    const location = purchaseData.locations[0];
    // Get the block size info
    const blockSizeInfo = BLOCK_SIZES[purchaseData.blockSize];

    const newBlock: PixelBlock = {
      id: Math.random().toString(36).substring(2, 15), // Generate a random ID
      projectName: purchaseData.projectDetails.projectName,
      developerName: purchaseData.projectDetails.developerName,
      description: purchaseData.projectDetails.description,
      websiteUrl: purchaseData.projectDetails.websiteUrl,
      thumbnailUrl: purchaseData.projectDetails.thumbnail
        ? URL.createObjectURL(purchaseData.projectDetails.thumbnail)
        : "",
      thumbnail_url: purchaseData.projectDetails.thumbnail
        ? URL.createObjectURL(purchaseData.projectDetails.thumbnail)
        : "", // Also set thumbnail_url for consistency
      x: location.x,
      y: location.y,
      width: blockSizeInfo.width,
      height: blockSizeInfo.height,
      color: "#6d28d9", // Default to purple
      category: purchaseData.projectDetails.category || "Other",
      email: purchaseData.projectDetails.email || "",
    };

    set((state) => ({
      pixelBlocks: [newBlock, ...state.pixelBlocks],
    }));

    // Force a refresh of stats after adding a block
    setTimeout(() => {
      get().fetchStats();
    }, 1000);
  },
}));

// Initialize by fetching stats when the store is first created
setTimeout(() => {
  useStore.getState().fetchStats();
}, 1000);
