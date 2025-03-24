import React, { useState } from "react";
import { Card } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

interface BlockSize {
  id: string;
  size: string;
  dimensions: string;
  price: number;
  description: string;
}

interface BlockSizeSelectorProps {
  selectedSize?: string;
  onSizeSelect?: (size: string) => void;
  onContinue?: () => void;
}

const BlockSizeSelector = ({
  selectedSize = "medium",
  onSizeSelect = () => {},
  onContinue = () => {},
}: BlockSizeSelectorProps) => {
  const [selected, setSelected] = useState(selectedSize);

  const blockSizes: BlockSize[] = [
    {
      id: "small",
      size: "Small",
      dimensions: "10×10",
      price: 10,
      description: "Perfect for personal projects",
    },
    {
      id: "medium",
      size: "Medium",
      dimensions: "20×20",
      price: 35,
      description: "Great for startups and small teams",
    },
    {
      id: "large",
      size: "Large",
      dimensions: "50×50",
      price: 200,
      description: "Maximum visibility for established projects",
    },
  ];

  const handleSizeChange = (value: string) => {
    setSelected(value);
    onSizeSelect(value);
  };

  return (
    <Card className="w-full p-6 bg-gray-900 border-gray-800">
      <h3 className="text-xl font-bold mb-4 text-white">Select Block Size</h3>
      <p className="text-gray-400 mb-6">
        Choose the size of your pixel block on the grid
      </p>

      <RadioGroup
        value={selected}
        onValueChange={handleSizeChange}
        className="space-y-3"
      >
        {blockSizes.map((block) => (
          <div
            key={block.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${selected === block.id ? "border-purple-500 bg-gray-800" : "border-gray-700 bg-gray-900"} hover:border-purple-500 transition-all cursor-pointer`}
            onClick={() => handleSizeChange(block.id)}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem
                value={block.id}
                id={block.id}
                className="text-purple-500"
              />
              <div>
                <Label htmlFor={block.id} className="text-white font-medium">
                  {block.size} ({block.dimensions})
                </Label>
                <p className="text-gray-400 text-sm">{block.description}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-purple-400 font-bold">${block.price}</span>
              {selected === block.id && (
                <Check className="ml-2 h-5 w-5 text-purple-500" />
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
    </Card>
  );
};

export default BlockSizeSelector;
