import { supabase } from "./supabase-client";

/**
 * Calculate the total cost based on block size and quantity
 */
export const calculateTotalCost = (
  blockSize: number | string,
  quantity: number,
): number => {
  // Fixed prices per block size according to Polar
  const priceMap = {
    small: 10,
    medium: 35,
    large: 200,
  };

  // Get price based on block size
  let price = 0;
  if (typeof blockSize === "string") {
    price = priceMap[blockSize] || 5; // Default to small price if not found
  } else {
    // Legacy number-based block sizes
    if (blockSize === 1)
      price = 10; // small
    else if (blockSize === 2)
      price = 35; // medium
    else if (blockSize === 4)
      price = 200; // large
    else price = 10; // Default to small price
  }

  return price * quantity;
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

    // Map block sizes to product IDs - using the correct IDs from Polar
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

    // Create a checkout session with Polar using their API format
    // See: https://docs.polar.sh/features/checkout/session
    const checkout = await polar.checkouts.create({
      productId,
      successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_ID}&status=success`,
      // Changed cancelUrl to returnUrl to match Polar API
      returnUrl: `${window.location.origin}/payment-cancel`,
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
    // Changed session_id to checkout_id to match the database schema
    await supabase.from("polar_checkouts").insert({
      checkout_id: checkout.id,
      email,
      block_size: blockSize,
      quantity,
      amount: calculateTotalCost(blockSize, quantity),
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

    // For development/testing, if the session ID contains "success" and we're not in production, consider it successful
    if (sessionId.includes("success") && !import.meta.env.PROD) {
      console.log(
        "Development mode: Auto-approving payment based on success in session ID",
      );

      // Update the payment status in the database
      // Changed session_id to checkout_id to match the database schema
      const { error } = await supabase
        .from("polar_checkouts")
        .update({ status: "completed" })
        .eq("checkout_id", sessionId);

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
        // Changed session_id to checkout_id to match the database schema
        const { error } = await supabase
          .from("polar_checkouts")
          .update({ status: "completed" })
          .eq("checkout_id", sessionId);

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
      // Changed session_id to checkout_id to match the database schema
      const { data: checkoutData, error: dbError } = await supabase
        .from("polar_checkouts")
        .select("*")
        .eq("checkout_id", sessionId)
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
