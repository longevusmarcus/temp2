import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreditCard, Calendar, Lock, ExternalLink } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BLOCK_SIZES } from "@/lib/types";
import { createPaymentSession, calculateTotalCost } from "@/lib/payment";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type PaymentFormValues = z.infer<typeof formSchema>;

interface PaymentFormProps {
  blockSize: string;
  locations: Array<{ x: number; y: number }>;
  projectDetails: any;
  onSubmit: () => void;
  onBack: () => void;
}

const PaymentForm = ({
  blockSize = "medium",
  locations = [{ x: 0, y: 0 }],
  projectDetails = {},
  onSubmit,
  onBack,
}: PaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const quantity = locations.length;
  const unitPrice = BLOCK_SIZES[blockSize].price;
  const totalPrice = calculateTotalCost(blockSize, quantity);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = async (values: PaymentFormValues) => {
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create a payment session with Polar.sh
      const purchaseData = {
        blockSize,
        locations,
        projectDetails: {
          ...projectDetails,
          email: values.email,
        },
      };

      const { sessionId, url } = await createPaymentSession(purchaseData);

      // Log the session details
      console.log(`Payment session created: ${sessionId}`);
      console.log(`Redirect URL: ${url}`);

      // Redirect to Polar.sh checkout page
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(
        "There was an error processing your payment. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-800 text-white">
      <h2 className="text-2xl font-bold mb-6 text-purple-400">
        Payment Details
      </h2>
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-400">Total Amount:</p>
            <p className="text-2xl font-bold text-white">
              ${totalPrice.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ${unitPrice.toFixed(2)} × {quantity}{" "}
              {quantity === 1 ? "block" : "blocks"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Block Size:</p>
            <p className="text-lg font-medium text-purple-400">
              {BLOCK_SIZES[blockSize].label}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {quantity} {quantity === 1 ? "location" : "locations"} selected
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    className="bg-gray-800 border-gray-700 text-white"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  We'll send your receipt and confirmation to this email.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {paymentError && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-md text-red-300 text-sm">
              {paymentError}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {isProcessing ? "Processing..." : "Proceed to Payment"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6 text-xs text-gray-500">
        <div className="flex items-center justify-center mb-2">
          <p className="mr-2">Secure payment powered by</p>
          <span className="font-semibold text-purple-400">Polar.sh</span>
          <ExternalLink className="h-3 w-3 ml-1 text-purple-400" />
        </div>
        <p className="text-center">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;
