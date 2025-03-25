import { supabase } from "./supabase-client";

/**
 * Calculate the total cost based on block size and quantity
 */
export const calculateTotalCost = (
  blockSize: number,
  quantity: number,
): number => {
  // Base price per block
  const basePrice = 10;

  // Apply discount for larger blocks
  let priceMultiplier = 1;
  if (blockSize === 2) priceMultiplier = 3.5; // 2x2 blocks cost 3.5x more than 1x1
  if (blockSize === 4) priceMultiplier = 12; // 4x4 blocks cost 12x more than 1x1

  return basePrice * priceMultiplier * quantity;
};

/**
 * Create a payment session with Polar
 */
export const createPaymentSession = async (
  email: string,
  blockSize: number,
  quantity: number,
  location: { x: number; y: number } | null,
) => {
  try {
    // Import the Polar client
    const { polar } = await import("./polar");

    // Determine the product ID based on block size
    let productId = "";
    if (blockSize === 1) productId = "cfbaa98b-9c03-47ba-902a-d4bd72309bf0"; // small
    if (blockSize === 2) productId = "77108715-fe2a-4dbe-bd7e-d6f94c636ee3"; // medium
    if (blockSize === 4) productId = "7f85613a-4ad5-4d36-9a9f-92f44d23087a"; // large

    if (!productId) {
      throw new Error(`Invalid block size: ${blockSize}`);
    }

    // Create a checkout session with Polar
    const checkout = await polar.checkouts.create({
      productId,
      quantity,
      customerEmail: email,
      metadata: {
        blockSize: String(blockSize),
        location: location ? JSON.stringify(location) : null,
        email,
      },
      successUrl: window.location.origin + "/payment-success",
      cancelUrl: window.location.origin + "/payment-cancel",
    });

    // Store the payment intent in the database
    await supabase.from("polar_checkouts").insert({
      session_id: checkout.id,
      email,
      block_size: blockSize,
      quantity,
      amount: calculateTotalCost(blockSize, quantity),
      location: location ? JSON.stringify(location) : null,
      status: "pending",
    });

    return {
      success: true,
      sessionId: checkout.id,
      url: checkout.url,
    };
  } catch (error) {
    console.error("Error creating payment session:", error);
    return {
      success: false,
      error: "Failed to create payment session",
    };
  }
};

/**
 * Verify a payment was successful
 */
export const verifyPayment = async (sessionId: string) => {
  try {
    // Import the Polar client
    const { polar } = await import("./polar");

    // Verify the checkout status with Polar API
    const checkout = await polar.checkouts.get({
      id: sessionId,
    });

    // Check if the payment was successful
    const isCompleted = checkout.status === "succeeded";

    if (isCompleted) {
      // Update the payment status in the database
      const { error } = await supabase
        .from("polar_checkouts")
        .update({ status: "completed" })
        .eq("session_id", sessionId);

      if (error) {
        console.error("Error updating payment status:", error);
        return {
          success: false,
          error: "Failed to update payment status",
        };
      }

      return {
        success: true,
        checkout,
      };
    } else {
      return {
        success: false,
        error: `Payment not completed. Status: ${checkout.status}`,
      };
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error: "Failed to verify payment",
    };
  }
};
