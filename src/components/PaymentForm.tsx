import React from "react";
import { Button } from "./ui/button";
import { Location, BlockSize } from "../lib/types";

interface PaymentFormProps {
  blockSize: BlockSize;
  locations: Location[];
  projectDetails: {
    projectName: string;
    developerName: string;
    description: string;
    websiteUrl: string;
    thumbnail: File | null;
    category: string;
    email: string;
  };
  onSubmit: () => void;
  onBack: () => void;
}

export default function PaymentForm({
  blockSize,
  locations,
  projectDetails,
  onSubmit,
  onBack,
}: PaymentFormProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-gray-800 border-gray-700">
        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
        <p className="text-sm text-gray-400 mb-4">
          Click the button below to complete your purchase.
        </p>
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit}>Complete Purchase</Button>
      </div>
    </div>
  );
}
