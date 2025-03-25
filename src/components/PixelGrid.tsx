import React, { useState, useRef, useEffect } from "react";
import { PixelBlock } from "@/lib/types";
import ProjectHoverCard from "./ProjectHoverCard";
import { ZoomIn, ZoomOut, Move } from "lucide-react";

interface PixelGridProps {
  blocks: PixelBlock[];
  gridSize?: number;
}

function PixelGrid({ blocks, gridSize = 1000000 }: PixelGridProps) {
  // Start with a medium scale to see the grid
  const [scale, setScale] = useState(0.4);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredBlock, setHoveredBlock] = useState<PixelBlock | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle zoom in
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.001));
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setPosition((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for mouse up outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-950 flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <div className="bg-gray-800 px-3 py-1 rounded-full text-white text-xs mr-2">
          {Math.round(scale * 100)}% | 100×100 grid cells (10×10 pixels each) =
          1,000,000 pixels
        </div>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Grid container */}
      <div
        ref={containerRef}
        className="flex-1 cursor-move relative overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Draggable/zoomable grid */}
        <div
          className="absolute origin-center transition-transform duration-100 border-2 border-blue-500"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            width: `1000px`,
            height: `1000px`,
            left: "50%",
            top: "50%",
            marginLeft: `-500px`,
            marginTop: `-500px`,
            imageRendering: "pixelated",
          }}
        >
          {/* Grid background */}
          <div
            className="absolute inset-0 bg-gray-900 border border-blue-600"
            style={{
              backgroundSize: "10px 10px, 10px 10px, 100px 100px, 100px 100px",
              backgroundImage:
                "linear-gradient(to right, rgba(100, 120, 200, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 120, 200, 0.3) 1px, transparent 1px), linear-gradient(to right, rgba(100, 120, 200, 0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 120, 200, 0.6) 1px, transparent 1px)",
              backgroundPosition: "0 0, 0 0, 0 0, 0 0",
            }}
          ></div>

          {/* Render pixel blocks */}
          {blocks.map((block) => (
            <ProjectHoverCard
              key={block.id}
              projectName={block.projectName}
              developerName={block.developerName}
              description={block.description}
              websiteUrl={block.websiteUrl}
              thumbnailUrl={block.thumbnailUrl}
              blockSize={{ width: block.width, height: block.height }}
            >
              <div
                className="absolute cursor-pointer hover:z-10 transition-all duration-150 hover:shadow-lg hover:shadow-purple-500/20 border border-transparent hover:border-purple-500/30"
                style={{
                  left: `${block.x}px`,
                  top: `${block.y}px`,
                  width: `${block.width}px`,
                  height: `${block.height}px`,
                  backgroundColor: block.thumbnailUrl
                    ? "transparent"
                    : block.color || "#5588ff",
                  backgroundImage: block.thumbnailUrl
                    ? `url(${block.thumbnailUrl})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                onMouseEnter={() => setHoveredBlock(block)}
                onMouseLeave={() => setHoveredBlock(null)}
                onClick={() => {
                  if (block.websiteUrl) {
                    window.open(block.websiteUrl, "_blank");
                  }
                }}
              >
                {!block.thumbnailUrl &&
                  block.width >= 20 &&
                  block.height >= 20 && (
                    <div className="absolute inset-0 flex items-center justify-center p-1 overflow-hidden">
                      <div className="text-xs text-white font-bold truncate text-center">
                        {block.projectName}
                      </div>
                    </div>
                  )}
              </div>
            </ProjectHoverCard>
          ))}
        </div>
      </div>

      {/* Drag indicator */}
      {isDragging && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-gray-900/80 text-white px-3 py-1 rounded-full flex items-center">
            <Move className="h-4 w-4 mr-1" />
            <span className="text-sm">Moving</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PixelGrid;
