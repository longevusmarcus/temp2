import React from "react";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { BLOCK_SIZES } from "@/lib/types";

interface PurchaseSuccessProps {
  blockSize: string;
  projectName: string;
  locations: Array<{ x: number; y: number }>;
  onClose: () => void;
  onViewGrid: () => void;
}

const PurchaseSuccess = ({
  blockSize = "medium",
  projectName = "Awesome Project",
  locations = [{ x: 100, y: 150 }],
  onClose,
  onViewGrid,
}: PurchaseSuccessProps) => {
  const blockSizeInfo = BLOCK_SIZES[blockSize];
  const totalCost = blockSizeInfo.price * locations.length;

  return (
    <div className="w-full max-w-md mx-auto bg-gray-900 p-8 rounded-lg border border-green-500/30 text-white">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>

        <h2 className="text-2xl font-bold text-green-400 mb-2">
          Purchase Successful!
        </h2>

        <p className="text-gray-300 mb-6">
          Your project "{projectName}" has been successfully added to The
          Million Dollar Vibe Page.
        </p>

        <div className="bg-gray-800 w-full p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Block Size</p>
              <p className="text-white font-medium">{blockSizeInfo.label}</p>
            </div>
            <div>
              <p className="text-gray-400">Number of Blocks</p>
              <p className="text-white font-medium">
                {locations.length} location{locations.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Dimensions</p>
              <p className="text-white font-medium">
                {blockSizeInfo.width}×{blockSizeInfo.height} pixels each
              </p>
            </div>
            <div>
              <p className="text-gray-400">Amount Paid</p>
              <p className="text-white font-medium">${totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button
            onClick={onViewGrid}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            View on Grid <ExternalLink className="ml-2 h-4 w-4" />
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
