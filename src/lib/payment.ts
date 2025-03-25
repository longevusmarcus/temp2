import { supabase } from "./supabase-client";

/**
 * Calculate the total cost based on block size and quantity
 */
export const calculateTotalCost = (
  blockSize: number | string,
  quantity: number,
): number => {
  // Base price per block
  const basePrice = 10;

  // Convert string blockSize to number if needed
  const size =
    typeof blockSize === "string"
      ? blockSize === "small"
        ? 1
        : blockSize === "medium"
          ? 2
          : 4
      : blockSize;

  // Apply discount for larger blocks
  let priceMultiplier = 1;
  if (size === 2) priceMultiplier = 3.5; // 2x2 blocks cost 3.5x more than 1x1
  if (size === 4) priceMultiplier = 12; // 4x4 blocks cost 12x more than 1x1

  return basePrice * priceMultiplier * quantity;
};

/**
 * Create a payment session with Polar
 */
export const createPaymentSession = async (
  email: string,
  blockSize: string,
  quantity: number,
  location: { x: number; y: number } | null,
  projectDetails: any = {},
) => {
  try {
    // Import the Polar client
    const { polar } = await import("./polar");

    // Map block sizes to product IDs
    const productIdMap = {
      small: "cfbaa98b-9c03-47ba-902a-d4bd72309bf0",
      medium: "77108715-fe2a-4dbe-bd7e-d6f94c636ee3",
      large: "7f85613a-4ad5-4d36-9a9f-92f44d23087a",
    };

    const productId = productIdMap[blockSize];
    if (!productId) {
      throw new Error(`Invalid block size: ${blockSize}`);
    }

    console.log(
      `Creating Polar checkout for product: ${productId}, size: ${blockSize}, quantity: ${quantity}`,
    );

    // Create a checkout session with Polar
    const checkout = await polar.checkouts.create({
      productId,
      successUrl:
        window.location.origin +
        "/payment-success?session_id={CHECKOUT_ID}&status=success",
      cancelUrl: window.location.origin + "/payment-cancel",
      customerEmail: email,
      metadata: {
        blockSize,
        locations: JSON.stringify(location ? [location] : []),
        email,
        projectName: projectDetails.projectName || "",
        developerName: projectDetails.developerName || "",
        description: projectDetails.description || "",
        websiteUrl: projectDetails.websiteUrl || "",
        category: projectDetails.category || "",
      },
    });

    console.log("Polar checkout created:", checkout);
    console.log("Checkout URL:", checkout.url);

    // Store the payment intent in the database
    await supabase.from("polar_checkouts").insert({
      session_id: checkout.id,
      email,
      block_size: blockSize,
      quantity,
      amount: calculateTotalCost(
        blockSize === "small" ? 1 : blockSize === "medium" ? 2 : 4,
        quantity,
      ),
      location: location ? JSON.stringify(location) : null,
      status: "pending",
      metadata: JSON.stringify(projectDetails),
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
      error: error.message || "Failed to create payment session",
    };
  }
};

/**
 * Verify a payment was successful
 */
export const verifyPayment = async (sessionId: string) => {
  try {
    console.log(`Verifying payment for session: ${sessionId}`);

    // For development/testing, if the session ID contains "success", consider it successful
    if (sessionId.includes("success")) {
      console.log(
        "Development mode: Auto-approving payment based on success in session ID",
      );

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

      return { success: true };
    }

    // Import the Polar client for real verification
    const { polar } = await import("./polar");

    try {
      // Verify the checkout status with Polar API
      const checkout = await polar.checkouts.get({
        id: sessionId,
      });

      console.log(`Checkout status: ${checkout.status}`);

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
    } catch (polarError) {
      console.error("Error fetching checkout from Polar:", polarError);

      // Check if we can find the checkout in our database
      const { data: checkoutData, error: dbError } = await supabase
        .from("polar_checkouts")
        .select("*")
        .eq("session_id", sessionId)
        .single();

      if (dbError) {
        console.error("Error fetching checkout from database:", dbError);
        return {
          success: false,
          error: "Failed to verify payment: Checkout not found",
        };
      }

      // If we have a record and it's marked as completed, consider it successful
      if (checkoutData && checkoutData.status === "completed") {
        return { success: true };
      }

      throw polarError;
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error: error.message || "Failed to verify payment",
    };
  }
};
