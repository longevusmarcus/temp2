import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import BlockSizeSelector from "./BlockSizeSelector";
import GridLocationPicker from "./GridLocationPicker";
import ProjectDetailsForm from "./ProjectDetailsForm";
import PurchaseSummary from "./PurchaseSummary";
import { BLOCK_SIZES, BlockSize, Location, ProjectDetails } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResponsivePurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchase: (data: {
    blockSize: BlockSize;
    locations: Location[];
    projectDetails: ProjectDetails;
  }) => void;
  availableLocations: Location[];
}

export default function ResponsivePurchaseDialog({
  open,
  onOpenChange,
  onPurchase,
  availableLocations,
}: ResponsivePurchaseDialogProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<BlockSize>("small");
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
    contactEmail: "",
    website: "",
    image: null,
    category: "Web App",
  });

  const handleSizeSelect = (size: BlockSize) => {
    setSelectedSize(size);
    setSelectedLocations([]);
  };

  const handleLocationSelect = (location: Location) => {
    if (
      selectedLocations.some(
        (loc) => loc.x === location.x && loc.y === location.y,
      )
    ) {
      setSelectedLocations(
        selectedLocations.filter(
          (loc) => !(loc.x === location.x && loc.y === location.y),
        ),
      );
    } else if (selectedLocations.length < 1) {
      // Only allow selecting one location for simplicity
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleProjectDetailsChange = (details: ProjectDetails) => {
    setProjectDetails(details);
  };

  const handlePurchase = () => {
    onPurchase({
      blockSize: selectedSize,
      locations: selectedLocations,
      projectDetails,
    });
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = () => {
    if (step === 1) return false;
    if (step === 2) return selectedLocations.length === 0;
    if (step === 3)
      return (
        !projectDetails.name ||
        !projectDetails.description ||
        !projectDetails.contactEmail
      );
    return false;
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-center mb-4">
              Select Block Size
            </h2>
            <BlockSizeSelector
              selectedSize={selectedSize}
              onSelect={handleSizeSelect}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-center mb-4">
              Select Location
            </h2>
            <div className="max-w-full overflow-x-auto pb-4">
              <GridLocationPicker
                blockSize={selectedSize}
                selectedLocations={selectedLocations}
                availableLocations={availableLocations}
                onLocationSelect={handleLocationSelect}
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Selected: {selectedLocations.length} location
              {selectedLocations.length !== 1 ? "s" : ""}
            </p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-center mb-4">
              Project Details
            </h2>
            <ProjectDetailsForm
              details={projectDetails}
              onChange={handleProjectDetailsChange}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-center mb-4">Review</h2>
            <PurchaseSummary
              blockSize={selectedSize}
              locations={selectedLocations}
              projectDetails={projectDetails}
              onConfirm={handlePurchase}
              onBack={prevStep}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Purchase a Pixel Block
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Progress indicator */}
          <div className="flex justify-between mb-6">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex flex-col items-center ${s <= step ? "text-primary" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${s <= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  {s}
                </div>
                <span className="text-xs hidden sm:inline">
                  {s === 1
                    ? "Size"
                    : s === 2
                      ? "Location"
                      : s === 3
                        ? "Details"
                        : "Review"}
                </span>
              </div>
            ))}
          </div>

          {renderStepContent()}

          {step < 4 && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="w-24"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>

              <Button
                onClick={nextStep}
                disabled={isNextDisabled()}
                className="w-24"
              >
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
