import { useState, useEffect, useRef } from "react";
import { Location, BlockSize, PixelBlock, BLOCK_SIZES } from "../lib/types";
import { useStore } from "../lib/store";

interface GridLocationPickerProps {
  onSelectLocations: (locations: Location[]) => void;
  selectedLocations: Location[];
  blockSize: BlockSize;
}

export function GridLocationPicker({
  onSelectLocations,
  selectedLocations,
  blockSize,
}: GridLocationPickerProps) {
  const { pixelBlocks } = useStore();
  const [grid, setGrid] = useState<
    Array<Array<{ x: number; y: number; isOccupied: boolean }>>
  >([]);
  const [hoveredCell, setHoveredCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const gridSize = 100; // 100x100 grid to match the full map

  // Get the dimensions of the selected block size in terms of grid units
  // small = 1x1 grid units (10x10 pixels)
  // medium = 2x2 grid units (20x20 pixels)
  // large = 5x5 grid units (50x50 pixels)
  const blockSizeInGridUnits = {
    small: { width: 1, height: 1 }, // 1x1 grid units = 10x10 pixels
    medium: { width: 2, height: 2 }, // 2x2 grid units = 20x20 pixels
    large: { width: 5, height: 5 }, // 5x5 grid units = 50x50 pixels
  }[blockSize] || { width: 1, height: 1 };

  // The actual pixel dimensions from BLOCK_SIZES remain the same for display purposes
  const blockDimensions = BLOCK_SIZES[blockSize] || { width: 10, height: 10 };

  useEffect(() => {
    // Initialize a grid (100x100)
    const newGrid: Array<Array<{ x: number; y: number; isOccupied: boolean }>> =
      [];

    // Create the grid
    for (let y = 0; y < gridSize; y++) {
      const row: Array<{ x: number; y: number; isOccupied: boolean }> = [];
      for (let x = 0; x < gridSize; x++) {
        // Check if this cell is occupied by any existing block
        const isOccupied = pixelBlocks.some(
          (block) =>
            x >= block.x &&
            x < block.x + block.width &&
            y >= block.y &&
            y < block.y + block.height,
        );
        row.push({ x, y, isOccupied });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  }, [pixelBlocks, blockSize]);

  // Function to check if a location is valid for selection
  const isValidLocation = (
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    // Check if the block would extend beyond the grid boundaries
    if (x < 0 || y < 0 || x + width > gridSize || y + height > gridSize) {
      return false;
    }

    // Check if any part of the block would overlap with occupied cells
    for (let yPos = y; yPos < y + height; yPos++) {
      for (let xPos = x; xPos < x + width; xPos++) {
        if (grid[yPos]?.[xPos]?.isOccupied) {
          return false;
        }
      }
    }

    return true;
  };

  const handleLocationClick = (location: { x: number; y: number }) => {
    // Don't allow selecting occupied cells
    const cell = grid[location.y]?.[location.x];
    if (!cell || cell.isOccupied) return;

    // Get the grid unit dimensions for the selected block size
    const gridUnitWidth = blockSizeInGridUnits.width;
    const gridUnitHeight = blockSizeInGridUnits.height;

    // Calculate the top-left corner of the block
    const blockStartX = location.x;
    const blockStartY = location.y;

    // Check if this block is already selected (using the top-left corner as reference)
    const isBlockSelected = selectedLocations.some(
      (loc) => loc.x === blockStartX && loc.y === blockStartY,
    );

    if (isBlockSelected) {
      // Remove the entire block
      onSelectLocations(
        selectedLocations.filter(
          (loc) => !(loc.x === blockStartX && loc.y === blockStartY),
        ),
      );
    } else {
      // Check if the location is valid for selection
      if (
        isValidLocation(blockStartX, blockStartY, gridUnitWidth, gridUnitHeight)
      ) {
        // Add the block (just store the top-left corner with the block size info)
        onSelectLocations([
          ...selectedLocations,
          { x: blockStartX, y: blockStartY },
        ]);
      }
    }
  };

  const handleCellHover = (x: number, y: number) => {
    // Only set hovered cell if it's a valid location for the current block size
    if (
      isValidLocation(
        x,
        y,
        blockSizeInGridUnits.width,
        blockSizeInGridUnits.height,
      )
    ) {
      setHoveredCell({ x, y });
    } else {
      // If not valid, still track the hover but mark it as invalid
      setHoveredCell({ x, y });
    }
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  // Function to check if a cell would be part of a block preview
  const isPartOfPreview = (x: number, y: number) => {
    if (!hoveredCell) return false;

    // Calculate the block area based on the hovered cell and grid unit dimensions
    const startX = hoveredCell.x;
    const startY = hoveredCell.y;
    const endX = startX + blockSizeInGridUnits.width - 1;
    const endY = startY + blockSizeInGridUnits.height - 1;

    // Check if this would be a valid placement
    const isValid = isValidLocation(
      hoveredCell.x,
      hoveredCell.y,
      blockSizeInGridUnits.width,
      blockSizeInGridUnits.height,
    );

    // Only show preview if it's within the cell and is valid
    return x >= startX && x <= endX && y >= startY && y <= endY && isValid;
  };

  // Function to check if a preview would be invalid
  const isInvalidPreview = (x: number, y: number) => {
    if (!hoveredCell) return false;

    // Calculate the block area based on the hovered cell and grid unit dimensions
    const startX = hoveredCell.x;
    const startY = hoveredCell.y;
    const endX = startX + blockSizeInGridUnits.width - 1;
    const endY = startY + blockSizeInGridUnits.height - 1;

    // Check if this would be a valid placement
    const isValid = isValidLocation(
      hoveredCell.x,
      hoveredCell.y,
      blockSizeInGridUnits.width,
      blockSizeInGridUnits.height,
    );

    // Show invalid preview if it's within the cell but not valid
    return x >= startX && x <= endX && y >= startY && y <= endY && !isValid;
  };

  // Function to check if a cell is part of a selected block
  const isPartOfSelectedBlock = (x: number, y: number) => {
    return selectedLocations.some((loc) => {
      const startX = loc.x;
      const startY = loc.y;
      const endX = startX + blockSizeInGridUnits.width - 1;
      const endY = startY + blockSizeInGridUnits.height - 1;

      return x >= startX && x <= endX && y >= startY && y <= endY;
    });
  };

  // Handle zoom controls
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
  };

  // Calculate cell size based on zoom level
  const cellSize = Math.max(Math.floor(5 * zoomLevel), 3); // Minimum 3px to keep cells visible

  // Calculate the total grid size in pixels
  const totalGridSize = gridSize * cellSize;

  // Get container dimensions for proper scaling
  const [containerDimensions, setContainerDimensions] = useState({
    width: 330,
    height: 350,
  });

  // Update container dimensions when ref changes or on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (gridContainerRef.current) {
        const { clientWidth } = gridContainerRef.current;
        setContainerDimensions({
          width: clientWidth - 16, // Account for padding
          height: 350 - 16, // Fixed height minus padding
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [gridContainerRef.current]);

  // We no longer need the scaleFactor calculation since we're applying zoom directly to the grid

  return (
    <div className="border rounded p-4 w-full">
      <div className="flex justify-end mb-2 gap-2">
        <button
          onClick={handleZoomOut}
          className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleZoomReset}
          className="px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
          title="Reset Zoom"
        >
          Reset
        </button>
      </div>

      <div
        ref={gridContainerRef}
        className="h-[350px] w-full overflow-auto border border-gray-700 p-4 bg-gray-950 relative"
        style={{ minHeight: "350px", maxHeight: "350px" }}
      >
        <div
          className="grid gap-0 border-t border-l border-gray-700"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
            width: `${totalGridSize}px`,
            height: `${totalGridSize}px`,
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left",
            transition: "transform 0.2s ease-out",
            margin: "0 auto",
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isSelected = isPartOfSelectedBlock(x, y);
              const showPreview = isPartOfPreview(x, y);
              const showInvalidPreview = isInvalidPreview(x, y);

              return (
                <div
                  key={`${x}-${y}`}
                  className={`border-r border-b border-gray-700 cursor-pointer ${isSelected ? "bg-blue-500" : cell.isOccupied ? "bg-red-500/30" : showPreview ? "bg-purple-500/30" : showInvalidPreview ? "bg-red-300/30" : "bg-gray-800"}`}
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  onClick={() => handleLocationClick({ x, y })}
                  onMouseEnter={() => handleCellHover(x, y)}
                  onMouseLeave={handleCellLeave}
                  title={`Position: ${x},${y} - ${cell.isOccupied ? "Occupied" : "Available"}`}
                />
              );
            }),
          )}
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Selected: {selectedLocations.length} blocks of {blockSize} size (
        {blockDimensions.width}×{blockDimensions.height} pixels each)
      </div>
      <div className="mt-1 text-xs text-gray-400 flex flex-wrap gap-x-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-800 border border-gray-700"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/30 border border-gray-700"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 border border-gray-700"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-purple-500/30 border border-gray-700"></div>
          <span>Valid Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-300/30 border border-gray-700"></div>
          <span>Invalid Preview</span>
        </div>
      </div>
    </div>
  );
}

// Add default export
export default GridLocationPicker;
