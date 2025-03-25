import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";
import { Button } from "./ui/button";
import { Check, DollarSign } from "lucide-react";
import { Location, BlockSize, ProjectDetails, BLOCK_SIZES } from "../lib/types";

// Define a local interface that matches the expected structure
interface FormattedProjectDetails {
  name: string;
  developer: string;
  description: string;
  url: string;
  category: string;
}

interface PurchaseSummaryProps {
  blockSize?: BlockSize | { width: number; height: number; label: string };
  locations?: Array<{ x: number; y: number }>;
  projectDetails?: ProjectDetails | FormattedProjectDetails;
  cost?: number;
  onConfirm?: () => void;
  onBack?: () => void;
}

const PurchaseSummary = ({
  blockSize = { width: 20, height: 20, label: "20×20" },
  locations = [{ x: 100, y: 150 }],
  projectDetails = {
    name: "Awesome Project",
    developer: "Cool Developer",
    description: "A fantastic project that showcases amazing coding skills",
    url: "https://example.com",
    category: "Web Development",
  },
  cost = 10,
  onConfirm = () => console.log("Purchase confirmed"),
  onBack = () => console.log("Go back"),
}: PurchaseSummaryProps) => {
  // Format blockSize if it's a string
  const formattedBlockSize =
    typeof blockSize === "string" ? BLOCK_SIZES[blockSize] : blockSize;

  // Format projectDetails if it's a ProjectDetails type
  const formattedProjectDetails: FormattedProjectDetails =
    projectDetails && "contactEmail" in projectDetails
      ? {
          name: projectDetails.name,
          developer: projectDetails.contactEmail,
          description: projectDetails.description,
          url: projectDetails.website,
          category: projectDetails.category,
        }
      : (projectDetails as FormattedProjectDetails);

  // Calculate total cost based on number of locations
  const totalCost = cost * locations.length;
  return (
    <Card className="w-full max-w-[550px] bg-gray-900 text-white border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-purple-400">
          Purchase Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-300">
            Selected Block
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-300">
                Size:{" "}
                <span className="text-white font-medium">
                  {formattedBlockSize.label}
                </span>
              </p>
              <p className="text-gray-300">
                Locations:{" "}
                <span className="text-white font-medium">
                  {locations.length} block{locations.length !== 1 ? "s" : ""}
                </span>
              </p>
              <div className="mt-1 max-h-16 overflow-y-auto text-xs text-gray-400">
                {locations.slice(0, 3).map((loc, index) => (
                  <p key={index}>
                    Location {index + 1}: ({loc.x}, {loc.y})
                  </p>
                ))}
                {locations.length > 3 && (
                  <p>...and {locations.length - 3} more</p>
                )}
              </div>
            </div>
            <div className="h-16 w-16 bg-purple-500 rounded-md flex items-center justify-center">
              <span className="text-xs">
                {formattedBlockSize.width}×{formattedBlockSize.height}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-300">
            Project Details
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check size={16} className="text-green-400 mr-2 mt-1" />
              <div>
                <span className="text-gray-300">Project Name: </span>
                <span className="text-white font-medium">
                  {formattedProjectDetails.name}
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-green-400 mr-2 mt-1" />
              <div>
                <span className="text-gray-300">Developer: </span>
                <span className="text-white font-medium">
                  {formattedProjectDetails.developer}
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-green-400 mr-2 mt-1" />
              <div>
                <span className="text-gray-300">Description: </span>
                <span className="text-white">
                  {formattedProjectDetails.description}
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-green-400 mr-2 mt-1" />
              <div>
                <span className="text-gray-300">Website URL: </span>
                <span className="text-white font-medium">
                  {formattedProjectDetails.url}
                </span>
              </div>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-green-400 mr-2 mt-1" />
              <div>
                <span className="text-gray-300">Category: </span>
                <span className="text-white font-medium">
                  {formattedProjectDetails.category}
                </span>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-purple-300">
                Cost Details
              </h3>
              <div className="text-sm text-gray-300">
                ${cost.toFixed(2)} × {locations.length} blocks
              </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <h3 className="text-lg font-medium text-purple-300">
                Total Cost
              </h3>
              <div className="flex items-center text-xl font-bold text-white">
                <DollarSign size={20} className="text-green-400" />
                {totalCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-4">
        <Button
          variant="outline"
          className="w-1/2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="w-1/2 bg-purple-600 hover:bg-purple-700 text-white"
          onClick={onConfirm}
        >
          Proceed to Payment
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PurchaseSummary;
