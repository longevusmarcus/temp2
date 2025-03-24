import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import { useStore } from "@/lib/store";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";

interface GridControlsProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (category: string) => void;
}

const GridControls = ({
  onSearch = () => {},
  onFilterChange = () => {},
}: GridControlsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { totalProjects, availablePixels, totalPixels, fetchStats } =
    useStore();
  const [availablePercentage, setAvailablePercentage] = useState(0);

  useEffect(() => {
    // Fetch stats when component mounts
    fetchStats();

    // Calculate available percentage
    const percentage =
      totalPixels > 0 ? Math.round((availablePixels / totalPixels) * 100) : 0;
    setAvailablePercentage(percentage);
  }, [fetchStats, availablePixels, totalPixels]);

  const categories = [
    "All Projects",
    "Web App",
    "Mobile App",
    "Gaming",
    "SaaS",
    "Social Networks",
    "Tools",
    "Ecommerces",
    "Others",
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-md border border-gray-800">
      <div className="space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex space-x-2">
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
          <Button type="submit" size="icon" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Separator className="bg-gray-700" />

        {/* Category Filter */}
        <div className="space-y-2">
          <span className="text-sm text-gray-300">Filter by Category</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <span>Select Category</span>
                <Filter className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] bg-gray-800 border-gray-700 text-white">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => onFilterChange(category)}
                  className="cursor-pointer hover:bg-gray-700"
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Summary */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>
              <div className="font-medium text-gray-300">Total Projects</div>
              <div className="text-cyan-400 font-bold">{totalProjects}</div>
            </div>
            <div>
              <div className="font-medium text-gray-300">Available Space</div>
              <div className="text-purple-400 font-bold">
                {availablePercentage}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridControls;
