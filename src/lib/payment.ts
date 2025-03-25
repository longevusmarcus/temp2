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
    // For production, this would call the Polar API
    // For now, we'll create a mock session
    const sessionId = `session_${Math.random().toString(36).substring(2, 15)}`;
    const successUrl = `/payment-success?session_id=${sessionId}&status=success`;

    // Store the payment intent in the database
    await supabase.from("polar_checkouts").insert({
      session_id: sessionId,
      email,
      block_size: blockSize,
      quantity,
      amount: calculateTotalCost(blockSize, quantity),
      location: location ? JSON.stringify(location) : null,
      status: "pending",
    });

    return {
      success: true,
      sessionId,
      url: successUrl,
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
    // In production, this would verify with Polar API
    // For now, we'll simulate a successful verification

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
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error: "Failed to verify payment",
    };
  }
};
