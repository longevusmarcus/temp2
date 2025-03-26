import React, { useState, useEffect, useRef } from "react";
import { PixelBlock } from "../lib/types";

interface PixelGridProps {
  blocks: PixelBlock[];
  gridSize: number;
}

const PixelGrid = ({ blocks, gridSize }: PixelGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  // Draw the grid and blocks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(scale, scale);

    // Draw grid background
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, gridSize, gridSize);

    // Draw grid lines
    ctx.strokeStyle = "#1F2937";
    ctx.lineWidth = 1 / scale;

    // Draw vertical lines
    for (let x = 0; x <= gridSize; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridSize);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= gridSize; y += 10) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gridSize, y);
      ctx.stroke();
    }

    // Draw blocks
    blocks.forEach((block) => {
      // Skip if block doesn't have position data
      if (block.x === undefined || block.y === undefined) return;

      // Draw block background
      ctx.fillStyle = block.color || "#4F46E5";
      ctx.fillRect(block.x, block.y, block.width, block.height);

      // Draw block border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1 / scale;
      ctx.strokeRect(block.x, block.y, block.width, block.height);

      // Draw block label if zoomed in enough
      if (scale > 0.5) {
        ctx.fillStyle = "white";
        ctx.font = `${12 / scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Truncate text if needed
        const maxWidth = block.width - 4;
        let text = block.projectName;
        if (ctx.measureText(text).width > maxWidth) {
          text = text.substring(0, 10) + "...";
        }

        ctx.fillText(
          text,
          block.x + block.width / 2,
          block.y + block.height / 2,
        );
      }
    });

    ctx.restore();
  }, [blocks, gridSize, viewOffset, scale]);

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setViewOffset((prev) => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle wheel events for zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    // Get mouse position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left - viewOffset.x;
    const mouseY = e.clientY - rect.top - viewOffset.y;

    // Calculate new scale
    const newScale = e.deltaY < 0 ? scale * 1.1 : scale / 1.1;
    const boundedScale = Math.min(Math.max(0.1, newScale), 5);

    // Adjust offset to zoom toward mouse position
    const scaleRatio = boundedScale / scale;
    const newOffsetX = viewOffset.x - mouseX * (scaleRatio - 1);
    const newOffsetY = viewOffset.y - mouseY * (scaleRatio - 1);

    setScale(boundedScale);
    setViewOffset({ x: newOffsetX, y: newOffsetY });
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
};

export default PixelGrid;
