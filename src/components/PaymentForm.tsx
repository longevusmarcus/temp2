import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Location, BlockSize } from "../lib/types";
import { createPaymentSession } from "../lib/payment";
import { Loader2, AlertCircle } from "lucide-react";

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
  const [polarTokenSet, setPolarTokenSet] = useState<boolean | null>(null);

  // Check if Polar token is set - using hardcoded token for development
  useEffect(() => {
    // Using hardcoded token for development
    const token = "polar_oat_dbK5SfcFfc7GZmp4bjqZ8ODQQzp3LC9vJ2zZV3UlhPT";
    setPolarTokenSet(true);
    console.log("PaymentForm: Using hardcoded Polar token for development");
  }, []);

  const handleSubmit = async () => {
    try {
      // Check if Polar token is set
      if (!polarTokenSet) {
        setError(
          "Polar API token is not configured. Please contact the administrator.",
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      // Call onSubmit to notify parent component
      onSubmit();

      // Create a payment session with Polar
      const result = await createPaymentSession(
        projectDetails.email,
        blockSize,
        locations.length, // Use actual quantity of locations
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
      setError(
        "An error occurred while processing your payment. Please check the console for details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-gray-800 border-gray-700">
        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
        <p className="text-sm text-gray-400 mb-4">
          Click the button below to complete your purchase with Polar.
        </p>

        {polarTokenSet === false && (
          <div className="p-3 mb-4 bg-amber-900/30 border border-amber-700 rounded-md text-amber-200 text-sm flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>
              Polar API token is not configured. Payment processing will not
              work. Please contact the administrator to set up the
              VITE_POLAR_ACCESS_TOKEN environment variable.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3 mt-2 bg-red-900/50 border border-red-700 rounded-md text-red-200 text-sm flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || polarTokenSet === false}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Complete Purchase"
          )}
        </Button>
      </div>
    </div>
  );
}
