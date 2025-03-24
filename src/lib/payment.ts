import { createClient } from "@supabase/supabase-js";
import { BLOCK_SIZES } from "./types";
import { Polar } from "@polar-sh/sdk";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Polar client
const polar = new Polar({
  accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN as string,
});

// Calculate the total cost based on block size and quantity
export function calculateTotalCost(
  blockSize: string,
  quantity: number,
): number {
  const unitPrice = BLOCK_SIZES[blockSize]?.price || 0;
  return unitPrice * quantity;
}

// Create a payment session with Polar.sh
export async function createPaymentSession(purchaseData: any) {
  const { blockSize, locations, projectDetails } = purchaseData;
  const quantity = locations.length;
  const totalAmount = calculateTotalCost(blockSize, quantity);

  try {
    // Save purchase data to Supabase
    const { data: checkoutData, error: checkoutError } = await supabase
      .from("polar_checkouts")
      .insert({
        checkout_id: `temp_${Date.now()}`, // Generate a temporary ID that will be updated
        email: projectDetails.email,
        metadata: {
          block_size: blockSize,
          locations: locations,
          project_details: projectDetails,
          amount: totalAmount,
        },
        status: "pending",
      })
      .select()
      .single();

    if (checkoutError) {
      console.error("Error saving checkout data:", checkoutError);
      throw new Error("Failed to save checkout data");
    }

    // Create checkout session with Polar
    const checkout = await polar.checkouts.create({
      successUrl: `${window.location.origin}/payment-success?session_id=${checkoutData.id}`,
      // Using returnUrl instead of cancelUrl as per Polar SDK requirements
      returnUrl: `${window.location.origin}/payment-cancel?session_id=${checkoutData.id}`,
      // Note: returnUrl replaces cancelUrl in the Polar SDK
      lineItems: [
        {
          priceId: BLOCK_SIZES[blockSize]?.price_id || "price_placeholder",
          quantity,
        },
      ],
      email: projectDetails.email,
    });

    // Update checkout record with Polar session ID
    const { error: updateError } = await supabase
      .from("polar_checkouts")
      .update({ checkout_id: checkout.id })
      .eq("id", checkoutData.id);

    if (updateError) {
      console.error("Error updating checkout with session ID:", updateError);
    }

    return {
      sessionId: checkout.id,
      url: checkout.url,
    };
  } catch (error) {
    console.error("Payment session creation error:", error);
    throw error;
  }
}

// Verify payment status after checkout completion
export async function verifyPayment(sessionId: string) {
  try {
    // Get checkout data from Supabase
    const { data: checkoutData, error: checkoutError } = await supabase
      .from("polar_checkouts")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (checkoutError) {
      console.error("Error retrieving checkout data:", checkoutError);
      throw new Error("Failed to retrieve checkout data");
    }

    if (!checkoutData) {
      throw new Error("Checkout session not found");
    }

    // If we have a Polar session ID, verify with Polar API
    if (checkoutData.checkout_id) {
      try {
        const checkoutStatus = await polar.checkouts.get(
          checkoutData.checkout_id,
        );

        // Update checkout status in Supabase based on Polar response
        // Fix the comparison by using string comparison instead of enum
        const newStatus =
          checkoutStatus.status.toString() === "complete"
            ? "completed"
            : checkoutData.status;

        // Update the checkout record with the latest status
        const { error: updateError } = await supabase
          .from("polar_checkouts")
          .update({ status: newStatus })
          .eq("id", sessionId);

        if (updateError) {
          console.error("Error updating checkout status:", updateError);
        }

        return {
          success: newStatus === "completed",
          status: newStatus,
          checkoutData: {
            ...checkoutData,
            status: newStatus,
          },
        };
      } catch (polarError) {
        console.error("Error verifying with Polar API:", polarError);
        // Return the current data we have if Polar API fails
        return {
          success: checkoutData.status === "completed",
          status: checkoutData.status,
          checkoutData,
          error: "Failed to verify with payment provider",
        };
      }
    }

    // If no Polar session ID, just return the current status
    return {
      success: checkoutData.status === "completed",
      status: checkoutData.status,
      checkoutData,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error;
  }
}
