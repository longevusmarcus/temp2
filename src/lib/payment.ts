import { createClient } from "@supabase/supabase-js";
import { BLOCK_SIZES } from "./types";
import { Polar } from "@polar-sh/sdk";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Polar client
const polar = new Polar({
  accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN || "",
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
      successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_ID}&status=success`,
      // cancelUrl is not supported in the Polar SDK type
      allowDiscountCodes: true,
      customerBillingAddress: {
        country: projectDetails.country || "US",
      },
      // Note: Using lineItems instead of items to match Polar SDK type
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
    console.log("🔍 Verifying payment for checkout:", sessionId);

    // Get checkout data from Supabase
    const { data: checkoutData, error: checkoutError } = await supabase
      .from("polar_checkouts")
      .select("*")
      .eq("checkout_id", sessionId)
      .single();

    if (checkoutError) {
      console.error("Error retrieving checkout data:", checkoutError);
      return {
        success: false,
        error: "Failed to retrieve checkout data",
      };
    }

    if (!checkoutData) {
      return {
        success: false,
        error: "Checkout session not found",
      };
    }

    // Verify with Polar API
    try {
      // Pass the sessionId as an object with id property to match CheckoutsGetRequest type
      const checkoutStatus = await polar.checkouts.get({ id: sessionId });

      // Update checkout status in Supabase based on Polar response
      const newStatus =
        checkoutStatus.status.toString() === "complete" ||
        checkoutStatus.status.toString() === "completed"
          ? "completed"
          : checkoutData.status;

      console.log("✅ Checkout status:", newStatus);

      // Update the checkout record with the latest status
      const { error: updateError } = await supabase
        .from("polar_checkouts")
        .update({ status: newStatus })
        .eq("id", checkoutData.id);

      if (updateError) {
        console.error("Error updating checkout status:", updateError);
      }

      // If payment is completed, update the project status
      if (newStatus === "completed" && checkoutData.metadata?.project_details) {
        // Here you could add code to update the project status or allocate the purchased blocks
        console.log(
          "🎉 Payment completed, processing purchase for project:",
          checkoutData.metadata.project_details.name || "Unknown",
        );
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
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
