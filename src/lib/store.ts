import { create } from "zustand";
import { supabase } from "./supabase-client";
import { PixelBlock, PurchaseData } from "./types";

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

      if (error) throw error;

      // Transform the data to match our PixelBlock type
      const blocks: PixelBlock[] = data.map((item) => ({
        id: item.id,
        projectName: item.project_name,
        developerName: item.developer_name,
        description: item.description,
        websiteUrl: item.website_url,
        thumbnailUrl: item.thumbnail_url,
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
    if (get().isFetchingStats || get().isLoading) {
      console.log("Stats fetch already in progress, skipping...");
      return;
    }

    set({ isFetchingStats: true });
    console.log("Starting to fetch stats from Supabase...");
    try {
      // Get total projects count
      const { count: projectCount, error: projectError } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      if (projectError) throw projectError;

      // Get sum of all pixel areas
      // Using a direct query instead of RPC function
      const { data: pixelData, error: pixelError } = await supabase
        .from("projects")
        .select("width, height");

      if (pixelError) throw pixelError;

      // Calculate total pixels manually
      const purchasedPixels = pixelData
        ? pixelData.reduce((sum, item) => sum + item.width * item.height, 0)
        : 0;
      const totalPixels = 1000000; // 1000x1000 grid
      const availablePixels = totalPixels - purchasedPixels;

      console.log("Fetched real stats from Supabase:", {
        totalProjects: projectCount,
        purchasedPixels,
        availablePixels,
        totalPixels,
      });

      set({
        totalProjects: projectCount || 0,
        purchasedPixels,
        availablePixels,
        totalPixels,
        isLoading: false,
        isFetchingStats: false,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      set({ isLoading: false, isFetchingStats: false });
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
  },
}));
