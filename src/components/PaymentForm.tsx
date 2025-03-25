import React, { useState } from "react";
import { Button } from "./ui/button";
import { Location, BlockSize } from "../lib/types";
import { createPaymentSession } from "../lib/payment";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call onSubmit to notify parent component
      onSubmit();

      // Create a payment session with Polar
      const result = await createPaymentSession(
        projectDetails.email,
        blockSize,
        1, // Quantity is always 1 for now
        locations.length > 0 ? locations[0] : null,
        projectDetails,
      );

      if (result.success && result.url) {
        // Redirect to Polar checkout page
        window.location.href = result.url;
      } else {
        setError(result.error || "Failed to create payment session");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("An error occurred while processing your payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-gray-800 border-gray-700">
        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
        <p className="text-sm text-gray-400 mb-4">
          Click the button below to complete your purchase.
        </p>
        {error && (
          <div className="p-3 mt-2 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Processing..." : "Complete Purchase"}
        </Button>
      </div>
    </div>
  );
}
