import React, { useMemo } from "react";
import { useStore } from "@/lib/store";
import { PixelBlock } from "@/lib/types";

interface AvailabilityMapProps {
  gridSize?: number;
  cellSize?: number;
  selectedSize?: { width: number; height: number };
  onLocationSelect?: (location: { x: number; y: number }) => void;
}

const AvailabilityMap = ({
  gridSize = 1000,
  cellSize = 10,
  selectedSize = { width: 20, height: 20 },
  onLocationSelect = () => {},
}: AvailabilityMapProps) => {
  const { pixelBlocks } = useStore();

  // Create a simplified grid representation to check availability
  const availabilityGrid = useMemo(() => {
    // Create a grid of cells (each cell represents a 10x10 area for simplicity)
    const gridCells = gridSize / cellSize;
    const grid = Array(gridCells)
      .fill(0)
      .map(() => Array(gridCells).fill(true));

    // Mark occupied cells
    pixelBlocks.forEach((block) => {
      const startX = Math.floor(block.x / cellSize);
      const startY = Math.floor(block.y / cellSize);
      const endX = Math.ceil((block.x + block.width) / cellSize);
      const endY = Math.ceil((block.y + block.height) / cellSize);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          if (x < gridCells && y < gridCells) {
            grid[y][x] = false; // Mark as occupied
          }
        }
      }
    });

    return grid;
  }, [pixelBlocks, gridSize, cellSize]);

  // Check if a location is available for the selected size
  const isLocationAvailable = (x: number, y: number) => {
    // Bounds checking first
    if (!availabilityGrid || !availabilityGrid.length || !availabilityGrid[0]) {
      return false;
    }

    const startX = Math.floor(x / cellSize);
    const startY = Math.floor(y / cellSize);
    const endX = Math.ceil((x + selectedSize.width) / cellSize);
    const endY = Math.ceil((y + selectedSize.height) / cellSize);

    // Check bounds before looping
    if (endX > availabilityGrid[0].length || endY > availabilityGrid.length) {
      return false;
    }

    // Check if any cell in the range is occupied
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (!availabilityGrid[y][x]) {
          return false;
        }
      }
    }

    return true;
  };

  // Generate a simplified visual representation of the grid
  const generateGrid = () => {
    const cells = [];
    const visibleCells = 50; // Reduced from 100 to 50 for better performance
    const cellSizeDisplay = 5; // Visual size of each cell

    for (let y = 0; y < visibleCells; y++) {
      for (let x = 0; x < visibleCells; x++) {
        // Check bounds before accessing the array
        const isAvailable =
          y < availabilityGrid.length &&
          x < availabilityGrid[0].length &&
          availabilityGrid[y][x];
        const actualX = x * cellSize;
        const actualY = y * cellSize;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`border border-gray-800 ${isAvailable ? "bg-green-800 hover:bg-green-700 cursor-pointer" : "bg-red-800/60"}`}
            style={{
              width: `${cellSizeDisplay}px`,
              height: `${cellSizeDisplay}px`,
            }}
            onClick={() => {
              if (isAvailable) {
                onLocationSelect({ x: actualX, y: actualY });
              }
            }}
            title={
              isAvailable ? `Available at (${actualX}, ${actualY})` : "Occupied"
            }
          />,
        );
      }
    }

    return cells;
  };

  return (
    <div className="w-full p-4 bg-gray-900 rounded-lg border border-gray-800">
      <h3 className="text-lg font-medium text-white mb-2">Availability Map</h3>
      <p className="text-sm text-gray-400 mb-2">
        Green areas are available. Click to select a location for your block.
      </p>

      <div className="overflow-auto max-h-[200px] border border-gray-700 rounded-lg p-2">
        <div
          className="grid gap-[1px]"
          style={{
            gridTemplateColumns: `repeat(50, 5px)`,
            width: "fit-content",
          }}
        >
          {generateGrid()}
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-400">
        <p>
          Selected block size: {selectedSize.width}×{selectedSize.height} pixels
        </p>
        <p>
          Available space:{" "}
          {Math.round(
            (availabilityGrid.flat().filter(Boolean).length /
              (availabilityGrid.length * availabilityGrid[0].length)) *
              100,
          )}
          %
        </p>
      </div>
    </div>
  );
};

export default AvailabilityMap;
