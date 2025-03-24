import React, { useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Info, RefreshCw } from "lucide-react";
import { useStore } from "../lib/store";

interface StatsPanelProps {
  className?: string;
}

const StatsPanel = ({ className }: StatsPanelProps) => {
  const {
    totalPixels,
    purchasedPixels,
    availablePixels,
    totalProjects,
    fetchStats,
    isLoading,
  } = useStore();

  useEffect(() => {
    // Fetch stats when component mounts
    fetchStats();

    // Set up an interval to refresh stats more frequently (every 10 seconds)
    const intervalId = setInterval(() => {
      fetchStats();
    }, 10000);

    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [fetchStats]);

  // Calculate percentage with safety check for zero or undefined values
  const percentagePurchased =
    totalPixels > 0 ? Math.round((purchasedPixels / totalPixels) * 100) : 0;

  return (
    <Card
      className={`w-full max-w-md bg-gray-900 border-gray-800 text-white shadow-lg ${className || ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-purple-400">Grid Stats</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStats()}
              className="text-gray-400 hover:text-gray-300 transition-all"
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-300">
                    <Info size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-gray-700">
                  <p>Real-time statistics of The Million Dollar Vibe Page</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Purchased</span>
            <span className="text-xl font-bold text-green-400">
              {isLoading ? "..." : `${percentagePurchased}%`}
            </span>
            <span className="text-xs text-gray-500">
              {isLoading
                ? "Loading..."
                : `${purchasedPixels.toLocaleString()} pixels (real data)`}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Available</span>
            <span className="text-xl font-bold text-blue-400">
              {isLoading ? "..." : `${100 - percentagePurchased}%`}
            </span>
            <span className="text-xs text-gray-500">
              {isLoading
                ? "Loading..."
                : `${availablePixels.toLocaleString()} pixels`}
            </span>
          </div>
        </div>

        <Separator className="my-3 bg-gray-700" />

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-400">Total Projects</span>
            <div className="text-xl font-bold text-purple-400">
              {isLoading ? "..." : totalProjects}
            </div>
            <div className="text-xs text-gray-500">
              (real count from database)
            </div>
          </div>

          <div className="h-2 w-full max-w-32 bg-gray-700 rounded-full overflow-hidden ml-4">
            {isLoading ? (
              <div
                className="h-full bg-gray-600 animate-pulse"
                style={{ width: "30%" }}
              />
            ) : (
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${percentagePurchased}%` }}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsPanel;
