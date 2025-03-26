import React, { useEffect } from "react";
import { useStore } from "../lib/store";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

const StatsPanel = () => {
  const {
    purchasedPixels,
    availablePixels,
    totalPixels,
    totalProjects,
    fetchStats,
  } = useStore();

  // Fetch stats when component mounts
  useEffect(() => {
    console.log("StatsPanel mounted, fetching stats...");
    fetchStats();

    // Set up an interval to refresh stats every 30 seconds
    const intervalId = setInterval(() => {
      console.log("Refreshing stats from interval...");
      fetchStats();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchStats]); // Include fetchStats in dependency array

  // Calculate percentages for progress bars
  const purchasedPercentage =
    Math.round((purchasedPixels / totalPixels) * 100) || 0;
  const availablePercentage =
    Math.round((availablePixels / totalPixels) * 100) || 0;

  return (
    <Card className="p-4 bg-gray-900 border border-gray-800 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-purple-400">
        Grid Statistics
      </h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-300">Total Projects</span>
            <span className="text-sm font-medium text-purple-400">
              {totalProjects}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-300">Purchased Pixels</span>
            <span className="text-sm font-medium text-purple-400">
              {purchasedPixels.toLocaleString()} ({purchasedPercentage}%)
            </span>
          </div>
          <Progress
            value={purchasedPercentage}
            className="h-2 bg-gray-700"
            indicatorClassName="bg-purple-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-300">Available Pixels</span>
            <span className="text-sm font-medium text-purple-400">
              {availablePixels.toLocaleString()} ({availablePercentage}%)
            </span>
          </div>
          <Progress
            value={availablePercentage}
            className="h-2 bg-gray-700"
            indicatorClassName="bg-pink-500"
          />
        </div>
      </div>
    </Card>
  );
};

export default StatsPanel;
