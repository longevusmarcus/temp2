import React, { useState, useEffect } from "react";
import Header from "./Header";
import PixelGrid from "./PixelGrid";
import GridControls from "./GridControls";
import ProjectHoverCard from "./ProjectHoverCard";
import PurchaseDialog from "./PurchaseDialog";
import StatsPanel from "./StatsPanel";
import { useStore } from "../lib/store";
import { PixelBlock, PurchaseData } from "../lib/types";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";

const Home = () => {
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Projects");
  const [filteredBlocks, setFilteredBlocks] = useState<PixelBlock[]>([]);

  // Get data from store
  const {
    pixelBlocks,
    purchasedPixels,
    availablePixels,
    totalPixels,
    addBlock,
    fetchStats,
  } = useStore();

  // Fetch stats when component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Filter blocks when search or category changes
  useEffect(() => {
    let filtered = [...pixelBlocks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (block) =>
          block.projectName.toLowerCase().includes(query) ||
          block.developerName.toLowerCase().includes(query) ||
          block.description.toLowerCase().includes(query),
      );
    }

    // Apply category filter
    if (selectedCategory !== "All Projects") {
      filtered = filtered.filter(
        (block) =>
          block.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    setFilteredBlocks(filtered);
  }, [pixelBlocks, searchQuery, selectedCategory]);

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleZoomChange = (value: number) => {
    setZoomLevel(value);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle category filter
  const handleFilterChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle purchase completion
  const handlePurchaseComplete = (purchaseData: PurchaseData) => {
    // Add the new block to the store
    addBlock(purchaseData);

    // Force a refresh of the filtered blocks
    setFilteredBlocks([]);

    // Set a timeout to refresh the data after the database has been updated
    setTimeout(() => {
      fetchStats();
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <Header onPurchaseClick={() => setIsPurchaseDialogOpen(true)} />

      {/* Main Content */}
      <main className="container mx-auto pt-24 pb-10 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:w-1/4">
            <GridControls
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />
            <div className="mt-6">
              <StatsPanel />
            </div>
          </div>

          {/* Main Grid Area */}
          <div className="lg:w-3/4 h-[700px] bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-xl">
            <PixelGrid
              blocks={filteredBlocks.length > 0 ? filteredBlocks : pixelBlocks}
              gridSize={1000}
            />
          </div>
        </div>

        {/* Featured Projects Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pixelBlocks.slice(0, 3).map((block) => (
              <div
                key={block.id}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 shadow-lg hover:shadow-purple-900/20 transition-shadow"
              >
                <ProjectHoverCard
                  projectName={block.projectName}
                  developerName={block.developerName}
                  description={block.description}
                  websiteUrl={block.websiteUrl}
                  thumbnailUrl={block.thumbnailUrl}
                  blockSize={{ width: block.width, height: block.height }}
                >
                  <div className="aspect-video w-full">
                    <img
                      src={block.thumbnailUrl}
                      alt={block.projectName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-purple-400">
                      {block.projectName}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      by {block.developerName}
                    </p>
                  </div>
                </ProjectHoverCard>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-8 rounded-lg border border-purple-800/30">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Immortalize Your Project
            </h2>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Inspired by the iconic "TheMillion Dollar Homepage" 2005 movement,
              The Million Dollar Vibe Page isn't just a tribute—it's a living
              legacy where projects and vibes endure. Secure your pixel block
              and forever preserve your vision on a digital tapestry shared with
              thousands of developers, creators, and dreamers. Give your project
              a lasting home, and let your innovation stand the test of time.
            </p>
            <Button
              onClick={() => setIsPurchaseDialogOpen(true)}
              className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 py-3 shadow-lg hover:shadow-purple-500/40 transition-all duration-300 font-medium animate-slow-pulse hover:animate-none hover:scale-105 border border-purple-400/30"
            >
              Immortalize Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} The Million Dollar Vibe Page. All
            rights reserved.
          </p>
          <p className="mt-2">
            Powered by IkiVibe Chōka Labs (b.y.)MBH CHE-344.214.080
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a href="#" className="hover:text-purple-400 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-purple-400 transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Purchase Button (Mobile) */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsPurchaseDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </div>

      {/* Purchase Dialog */}
      <PurchaseDialog
        open={isPurchaseDialogOpen}
        onOpenChange={setIsPurchaseDialogOpen}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  );
};

export default Home;
