import React, { useState, useEffect, useRef } from "react";
import { PixelBlock } from "../lib/types";

interface PixelGridProps {
  blocks: PixelBlock[];
  gridSize: number;
}

const PixelGrid = ({ blocks = [], gridSize = 1000 }: PixelGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  // Adjust scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        const minDimension = Math.min(containerWidth, containerHeight);
        setScale(minDimension / gridSize);
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [gridSize]);

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartPos({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPosition({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
  };

  // Log blocks for debugging
  useEffect(() => {
    console.log("PixelGrid received blocks:", blocks.length, blocks);
  }, [blocks]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-gray-900 cursor-move"
    >
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 bg-gray-800 rounded-md p-2 flex flex-col gap-2 md:z-20">
        <button
          className={`px-2 py-1 rounded-sm text-xs ${zoomLevel === 0.2 ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => handleZoomChange(0.2)}
        >
          20%
        </button>
        <button
          className={`px-2 py-1 rounded-sm text-xs ${zoomLevel === 0.4 ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => handleZoomChange(0.4)}
        >
          40%
        </button>
        <button
          className={`px-2 py-1 rounded-sm text-xs ${zoomLevel === 0.6 ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => handleZoomChange(0.6)}
        >
          60%
        </button>
        <button
          className={`px-2 py-1 rounded-sm text-xs ${zoomLevel === 0.8 ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => handleZoomChange(0.8)}
        >
          80%
        </button>
        <button
          className={`px-2 py-1 rounded-sm text-xs ${zoomLevel === 1 ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => handleZoomChange(1)}
        >
          100%
        </button>
      </div>

      <div
        className="absolute origin-top-left transition-transform duration-100"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
          width: `${gridSize}px`,
          height: `${gridSize}px`,
        }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 border border-gray-700 bg-gray-900/50"
          style={{ width: gridSize, height: gridSize }}
        >
          {/* Grid lines */}
          <svg width={gridSize} height={gridSize} className="absolute inset-0">
            {/* Vertical grid lines */}
            {Array.from({ length: gridSize / 10 + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 10}
                y1={0}
                x2={i * 10}
                y2={gridSize}
                stroke="#374151"
                strokeWidth="0.5"
              />
            ))}
            {/* Horizontal grid lines */}
            {Array.from({ length: gridSize / 10 + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * 10}
                x2={gridSize}
                y2={i * 10}
                stroke="#374151"
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </div>

        {/* Render pixel blocks */}
        {blocks.map((block) => (
          <div
            key={block.id}
            className="absolute border border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/30 transition-colors duration-200 cursor-pointer overflow-hidden"
            style={{
              left: block.x,
              top: block.y,
              width: block.width,
              height: block.height,
            }}
            title={`${block.projectName} by ${block.developerName}`}
          >
            {block.thumbnailUrl && (
              <img
                src={block.thumbnailUrl}
                alt={block.projectName}
                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
              />
            )}
            {block.width > 30 && block.height > 20 && (
              <div className="absolute inset-0 flex items-center justify-center p-1">
                <span className="text-xs text-white text-center font-medium truncate bg-black/50 px-1 rounded">
                  {block.projectName}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Invisible overlay for drag handling */}
      <div
        className="absolute inset-0 z-10 pointer-events-auto"
        style={{ pointerEvents: "auto" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
};

export default PixelGrid;
