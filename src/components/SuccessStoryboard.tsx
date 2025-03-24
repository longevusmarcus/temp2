import React from "react";
import PurchaseSuccess from "./PurchaseSuccess";

const SuccessStoryboard = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <PurchaseSuccess
        blockSize="medium"
        projectName="Awesome Project"
        locations={[{ x: 100, y: 150 }]}
        onClose={() => console.log("Close clicked")}
        onViewGrid={() => console.log("View grid clicked")}
      />
    </div>
  );
};

export default SuccessStoryboard;
