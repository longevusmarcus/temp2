import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-red-500/30 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Payment Cancelled
          </h2>

          <p className="text-gray-300 mb-6">
            Your payment was cancelled. No charges have been made to your
            account.
          </p>

          <div className="w-full mt-4">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
