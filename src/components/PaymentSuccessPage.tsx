import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { verifyPayment } from "../lib/payment";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const status = searchParams.get("status");

  useEffect(() => {
    // Handle cancellation if user navigated back or closed the payment page
    if (!status && sessionId) {
      navigate("/payment-cancel");
      return;
    }

    // Verify the payment was successful
    if (sessionId && status === "success") {
      const checkPayment = async () => {
        try {
          const result = await verifyPayment(sessionId);
          if (!result.success) {
            // If payment verification fails, redirect to home
            console.error(
              "Payment verification failed:",
              result.error || "Unknown error",
            );
            navigate("/");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          navigate("/");
        }
      };

      checkPayment();
    }
  }, [sessionId, status, navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-green-500/30 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-green-400 mb-2">
            Payment Successful!
          </h2>

          <p className="text-gray-300 mb-6">
            Your purchase has been completed successfully. Your pixel blocks
            have been added to the Million Dollar Vibe Page.
          </p>

          <div className="w-full mt-4">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              View Your Blocks <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
