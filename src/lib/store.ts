import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PixelBlock, PurchaseData, BLOCK_SIZES } from "./types";
import { supabase } from "./supabase-client";

// Log Supabase client status
console.log("Store using shared Supabase client instance");

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

interface StoreState {
  pixelBlocks: PixelBlock[];
  purchasedPixels: number;
  availablePixels: number;
  totalPixels: number;
  totalProjects: number;
  addBlock: (purchaseData: PurchaseData) => void;
  getRandomColor: () => string;
  fetchStats: () => Promise<void>;
  findBlocksByEmail: (email: string) => Promise<PixelBlock[]>;
  isLoading: boolean;
}

// Initial blocks data - empty array as we're not using fake data anymore
const initialBlocks: PixelBlock[] = [];

// Calculate initial purchased pixels
const calculateInitialPurchasedPixels = (blocks: PixelBlock[]) => {
  return blocks.reduce((total, block) => total + block.width * block.height, 0);
};

const initialPurchasedPixels = calculateInitialPurchasedPixels(initialBlocks);
const totalPixels = 1000000; // 1000x1000 grid

export const useStore = create(
  persist<StoreState>(
    (set, get) => ({
      pixelBlocks: initialBlocks,
      purchasedPixels: initialPurchasedPixels,
      availablePixels: totalPixels - initialPurchasedPixels,
      totalPixels: totalPixels,
      totalProjects: initialBlocks.length,
      isLoading: false,

      fetchStats: async () => {
        set({ isLoading: true });
        console.log("Starting to fetch stats from Supabase...");
        try {
          // Force clear browser cache for this request
          const cacheBreaker = new Date().getTime();
          // Clear any existing data first to prevent showing stale data
          set({
            pixelBlocks: [],
            totalProjects: 0,
            purchasedPixels: 0,
            availablePixels: totalPixels,
          });

          // Fetch all projects from Supabase to get accurate data
          const { data: projectsData, error: projectsError } = await supabase
            .from("projects")
            .select("*");

          if (projectsError) {
            console.error("Error fetching projects data:", projectsError);
            throw projectsError;
          }

          // Calculate real stats from the fetched data
          const realProjectCount = projectsData ? projectsData.length : 0;

          // Calculate total purchased pixels from actual project data
          let realPurchasedPixels = 0;

          if (projectsData && projectsData.length > 0) {
            realPurchasedPixels = projectsData.reduce((total, block) => {
              const width = block.width || 0;
              const height = block.height || 0;
              return total + width * height;
            }, 0);
          }

          console.log("Fetched real stats from Supabase:", {
            realProjectCount,
            projectsData: projectsData?.length,
            realPurchasedPixels,
          });

          // Get current blocks to preserve any newly added blocks that might not be in the database yet
          const currentBlocks = get().pixelBlocks;
          const currentBlockIds = new Set(
            currentBlocks.map((block) => block.id),
          );

          // Map database projects to PixelBlock format
          const dbBlocks = projectsData
            ? projectsData.map((project) => ({
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
                category: (project as any).category || "",
              }))
            : [];

          // Filter out any blocks from the database that we already have locally
          // (to avoid duplicates with different IDs)
          const dbBlockIds = new Set(dbBlocks.map((block) => block.id));

          // Keep local blocks that aren't in the database yet
          const localOnlyBlocks = currentBlocks.filter(
            (block) => !block.id.includes("-") && !dbBlockIds.has(block.id),
          );

          // Combine database blocks with any local-only blocks
          const mergedBlocks = [...dbBlocks, ...localOnlyBlocks];

          // Calculate the total purchased pixels including both DB and local blocks
          const totalPurchasedPixels =
            realPurchasedPixels +
            localOnlyBlocks.reduce(
              (total, block) => total + block.width * block.height,
              0,
            );

          // Update the store with the merged data
          set({
            pixelBlocks: mergedBlocks,
            totalProjects: realProjectCount + localOnlyBlocks.length,
            purchasedPixels: totalPurchasedPixels,
            availablePixels: totalPixels - totalPurchasedPixels,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error fetching stats:", error);
          // Only update loading state on error, keep existing data
          set((state) => ({
            ...state,
            isLoading: false,
          }));
          console.error("Failed to update stats, will retry in 5 seconds");

          // Try to fetch the data again after a short delay
          setTimeout(() => {
            console.log("Retrying to fetch stats...");
            get().fetchStats();
          }, 5000);
        }
      },

      addBlock: async (purchaseData: PurchaseData) => {
        console.log("Adding new block to Supabase...");
        const blockSizeInfo = BLOCK_SIZES[purchaseData.blockSize];

        // Handle the thumbnail image properly
        let thumbnailUrl =
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80";

        if (purchaseData.projectDetails.thumbnail) {
          // Convert the file to a base64 string for persistence
          const reader = new FileReader();

          // Create a promise to handle the async file reading
          const readFileAsDataURL = (file) => {
            return new Promise((resolve) => {
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
          };

          // Wait for the file to be read
          thumbnailUrl = (await readFileAsDataURL(
            purchaseData.projectDetails.thumbnail,
          )) as string;
        }

        // Create a single block that spans all selected locations
        const minX = Math.min(...purchaseData.locations.map((loc) => loc.x));
        const minY = Math.min(...purchaseData.locations.map((loc) => loc.y));
        const maxX =
          Math.max(...purchaseData.locations.map((loc) => loc.x)) +
          blockSizeInfo.width;
        const maxY =
          Math.max(...purchaseData.locations.map((loc) => loc.y)) +
          blockSizeInfo.height;

        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;

        // Create the new block first to update local state immediately
        const newBlock: PixelBlock = {
          id: `${Date.now()}`,
          x: minX,
          y: minY,
          width: totalWidth,
          height: totalHeight,
          projectName: purchaseData.projectDetails.projectName,
          developerName: purchaseData.projectDetails.developerName,
          description: purchaseData.projectDetails.description,
          thumbnailUrl: thumbnailUrl,
          websiteUrl: purchaseData.projectDetails.websiteUrl,
          color: getRandomColor(),
          category: purchaseData.projectDetails.category || "",
        };

        // Update local state immediately
        const totalBlockSize =
          blockSizeInfo.width *
          blockSizeInfo.height *
          purchaseData.locations.length;

        set((state) => ({
          pixelBlocks: [...state.pixelBlocks, newBlock],
          purchasedPixels: state.purchasedPixels + totalBlockSize,
          availablePixels: state.availablePixels - totalBlockSize,
          totalProjects: state.totalProjects + 1, // Increment project count
        }));

        // Then save to Supabase
        try {
          const { data, error } = await supabase
            .from("projects")
            .insert({
              project_name: purchaseData.projectDetails.projectName,
              developer_name: purchaseData.projectDetails.developerName,
              description: purchaseData.projectDetails.description,
              website_url: purchaseData.projectDetails.websiteUrl,
              thumbnail_url: thumbnailUrl,
              x: minX,
              y: minY,
              width: totalWidth,
              height: totalHeight,
              color: newBlock.color, // Use the same color as the local block
            })
            .select();

          if (error) throw error;
          console.log("Project saved to Supabase:", data);

          // Don't immediately fetch stats as it might overwrite our local changes
          // Instead, wait a bit longer to ensure the database has time to update
          setTimeout(() => get().fetchStats(), 2000);
        } catch (error) {
          console.error("Error saving project to Supabase:", error);
        }
      },

      getRandomColor: getRandomColor,

      findBlocksByEmail: async (email: string) => {
        try {
          console.log("Looking for blocks by email:", email);

          // First check if there are any projects at all in the database
          const { data: countData, error: countError } = await supabase
            .from("projects")
            .select("id", { count: "exact" });

          if (countError) {
            console.error("Error counting projects:", countError);
            throw countError;
          }

          console.log(`Total projects in database: ${countData?.length || 0}`);

          // If no projects at all, return early with a special flag
          if (!countData || countData.length === 0) {
            console.error(
              "Database appears to be empty - no projects found at all",
            );
            return [];
          }

          // Try to find projects with the email in developer_name using multiple search strategies
          const { data: projectsData, error: projectsError } = await supabase
            .from("projects")
            .select("*")
            .or(
              `developer_name.ilike.%${email}%,email.eq.${email},developer_name.eq.${email}`,
            );

          if (projectsError) {
            console.error("Error in primary search:", projectsError);
            throw projectsError;
          }

          // If no results with primary search, try a more flexible search
          if (!projectsData || projectsData.length === 0) {
            console.log(
              "No results with primary search, trying more flexible search...",
            );

            // Try to get a sample of projects to see what's in the database
            const { data: sampleProjects, error: sampleError } = await supabase
              .from("projects")
              .select("*")
              .limit(3);

            if (sampleError) {
              console.error("Error fetching sample projects:", sampleError);
            } else if (sampleProjects && sampleProjects.length > 0) {
              console.log("Sample projects in database:", sampleProjects);

              // Try a more flexible search with username part of email
              const username = email.split("@")[0];
              const { data: flexData, error: flexError } = await supabase
                .from("projects")
                .select("*")
                .or(
                  `developer_name.ilike.%${username}%,project_name.ilike.%${username}%`,
                );

              if (flexError) {
                console.error("Error in flexible search:", flexError);
              } else if (flexData && flexData.length > 0) {
                console.log("Found blocks with flexible search:", flexData);

                // Map database projects to PixelBlock format
                const foundBlocks = flexData.map((project) => ({
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
                  category: (project as any).category || "",
                }));

                return foundBlocks;
              }
            }
          }

          // Map database projects to PixelBlock format from primary search
          const foundBlocks = projectsData
            ? projectsData.map((project) => ({
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
                category: (project as any).category || "",
              }))
            : [];

          console.log("Found blocks with primary search:", foundBlocks);
          return foundBlocks;
        } catch (error) {
          console.error("Error finding blocks by email:", error);
          return [];
        }
      },
    }),
    {
      name: "million-dollar-vibe-storage",
    },
  ),
);
