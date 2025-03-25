import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import GridLocationPicker from "./GridLocationPicker";
import BlockSizeSelector from "./BlockSizeSelector";
import ProjectDetailsForm from "./ProjectDetailsForm";
import PurchaseSummary from "./PurchaseSummary";
import { Location, ProjectDetails, BlockSize, BLOCK_SIZES } from "../lib/types";

interface PurchaseDialogProps {
  onPurchase?: (
    locations: Location[],
    blockSize: BlockSize,
    projectDetails: ProjectDetails,
  ) => void;
  onPurchaseComplete?: (purchaseData: any) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PurchaseDialog({
  onPurchase,
  onPurchaseComplete,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: PurchaseDialogProps) {
  const [step, setStep] = useState<
    "size" | "location" | "details" | "summary" | "payment"
  >("size");
  const [locations, setLocations] = useState<Location[]>([]);
  const [blockSize, setBlockSize] = useState<BlockSize>("small");
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
    contactEmail: "",
    website: "",
    image: null,
    category: "Web Development",
  });
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
    },
    [onOpenChange],
  );

  const handleLocationSelect = useCallback((newLocations: Location[]) => {
    setLocations(newLocations);
  }, []);

  const handleBlockSizeSelect = useCallback((size: BlockSize) => {
    setBlockSize(size);
    setStep("location");
  }, []);

  const handleProjectDetailsSubmit = useCallback((details: ProjectDetails) => {
    setProjectDetails(details);
    setStep("summary");
  }, []);

  const handlePurchase = useCallback(() => {
    if (onPurchase) {
      onPurchase(locations, blockSize, projectDetails);
    }

    if (onPurchaseComplete) {
      const purchaseData = {
        blockSize,
        locations,
        projectDetails: {
          projectName: projectDetails.name,
          developerName: projectDetails.contactEmail,
          description: projectDetails.description,
          websiteUrl: projectDetails.website,
          thumbnail: projectDetails.image || null,
          category: projectDetails.category,
          email: projectDetails.contactEmail,
        },
      };
      onPurchaseComplete(purchaseData);
    }

    setOpen(false);
    // Reset state
    setStep("size");
    setLocations([]);
    setBlockSize("small");
    setProjectDetails({
      name: "",
      description: "",
      contactEmail: "",
      website: "",
      image: null,
      category: "Web Development",
    });
  }, [
    blockSize,
    locations,
    onPurchase,
    onPurchaseComplete,
    projectDetails,
    setOpen,
  ]);

  const handleNext = useCallback(() => {
    if (step === "size") {
      setStep("location");
    } else if (step === "location" && locations.length > 0) {
      setStep("details");
    } else if (step === "details") {
      setStep("summary");
    } else if (step === "summary") {
      setStep("payment");
    }
  }, [step, locations.length]);

  const handleBack = useCallback(() => {
    if (step === "location") {
      setStep("size");
    } else if (step === "details") {
      setStep("location");
    } else if (step === "summary") {
      setStep("details");
    } else if (step === "payment") {
      setStep("summary");
    }
  }, [step]);

  const getStepTitle = () => {
    switch (step) {
      case "size":
        return "Select Block Size";
      case "location":
        return "Select Grid Location";
      case "details":
        return "Project Details";
      case "summary":
        return "Purchase Summary";
      case "payment":
        return "Payment";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "size":
        return "Choose the size of your pixel block.";
      case "location":
        return "Choose the location on the grid for your project.";
      case "details":
        return "Provide details about your project.";
      case "summary":
        return "Review your purchase before confirming.";
      case "payment":
        return "Complete your purchase.";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && !controlledOpen ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !controlledOpen ? (
        <DialogTrigger asChild>
          <span style={{ display: "none" }}></span>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-[600px] sm:max-h-[80vh] overflow-y-auto backdrop-blur-sm bg-background/95">
        {/* Modern close button */}
        <DialogClose className="absolute right-4 top-4 p-2 text-white bg-purple-500/20 hover:bg-purple-500/40 rounded-full transition-all duration-200 ease-in-out">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Stepper UI */}
        <div className="bg-gray-900 -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <h1 className="text-center text-2xl font-bold text-purple-400 mb-4">
            Purchase Pixel Blocks
          </h1>
          <div className="flex justify-center items-center space-x-4">
            <div
              className={`px-4 py-2 rounded-md ${step === "size" ? "bg-purple-500 text-white" : "text-gray-400"}`}
            >
              Size
            </div>
            <div
              className={`px-4 py-2 rounded-md ${step === "location" ? "bg-purple-500 text-white" : "text-gray-400"}`}
            >
              Location
            </div>
            <div
              className={`px-4 py-2 rounded-md ${step === "details" ? "bg-purple-500 text-white" : "text-gray-400"}`}
            >
              Details
            </div>
            <div
              className={`px-4 py-2 rounded-md ${step === "summary" ? "bg-purple-500 text-white" : "text-gray-400"}`}
            >
              Summary
            </div>
            <div
              className={`px-4 py-2 rounded-md ${step === "payment" ? "bg-purple-500 text-white" : "text-gray-400"}`}
            >
              Payment
            </div>
          </div>
        </div>

        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>{getStepDescription()}</DialogDescription>
        </DialogHeader>

        {step === "size" && (
          <div className="space-y-4">
            <BlockSizeSelector
              onSizeSelect={handleBlockSizeSelect}
              selectedSize={blockSize}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep("location")}>Next</Button>
            </div>
          </div>
        )}

        {step === "location" && (
          <div className="space-y-4">
            <GridLocationPicker
              onSelectLocations={handleLocationSelect}
              selectedLocations={locations}
              blockSize={blockSize}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={locations.length === 0}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <ProjectDetailsForm
              initialValues={projectDetails}
              onSubmit={handleProjectDetailsSubmit}
              onCancel={handleBack}
            />
          </div>
        )}

        {step === "summary" && (
          <div className="space-y-4">
            <PurchaseSummary
              locations={locations}
              blockSize={BLOCK_SIZES[blockSize]}
              projectDetails={{
                name: projectDetails.name,
                developer: projectDetails.contactEmail,
                description: projectDetails.description,
                url: projectDetails.website,
                category: projectDetails.category,
              }}
            />
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handlePurchase}>Confirm Purchase</Button>
            </div>
          </div>
        )}

        {step === "payment" && (
          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <p>Payment processing would be implemented here.</p>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handlePurchase}>Complete Payment</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Add default export
export default PurchaseDialog;
