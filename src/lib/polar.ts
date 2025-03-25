import { Polar } from "@polar-sh/sdk";

// Initialize the Polar client with better error logging
const polarToken = "polar_oat_dbK5SfcFfc7GZmp4bjqZ8ODQQzp3LC9vJ2zZV3UlhPT";

// Use the hardcoded token for development
export const polar = new Polar({
  accessToken: polarToken,
});

// Log Polar configuration on initialization
console.log(
  `Polar client initialized with token: ${polarToken ? "[SET]" : "[NOT SET]"} (length: ${polarToken.length})`,
);
if (!polarToken) {
  console.warn(
    "WARNING: Polar access token is not set. Payment processing will fail.",
  );
} else {
  console.log(
    `Token starts with: ${polarToken.substring(0, 5)}... and ends with: ...${polarToken.substring(polarToken.length - 5)}`,
  );
}

/**
 * Get customer state by external ID
 * @param externalId The external customer ID
 * @returns The customer state
 */
export async function getCustomerStateByExternalId(externalId: string) {
  try {
    const result = await polar.customers.getStateExternal({
      externalId,
    });
    return result;
  } catch (error) {
    console.error("Error fetching customer state:", error);
    throw error;
  }
}

/**
 * Run a test to check if the Polar API is working
 * @param externalId The external customer ID to test with
 */
export async function testPolarApi(externalId: string) {
  try {
    // Log the attempt for debugging
    console.log(`Attempting to test Polar API with external ID: ${externalId}`);

    // For testing purposes, if the ID is empty or the default, use a mock response
    if (!externalId || externalId === "customer_1234") {
      console.log("Using mock response for testing purposes");
      return {
        subscriptions: [],
        has_active_subscription: false,
        customer: {
          id: "mock-customer-id",
          external_id: externalId || "customer_1234",
          email: "test@example.com",
          name: "Test Customer",
        },
        _mock: true,
      };
    }

    const result = await getCustomerStateByExternalId(externalId);
    console.log("Polar API test result:", result);
    return result;
  } catch (error) {
    console.error("Polar API test failed:", error);
    // Enhance error object with more details if available
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.error && error.detail) {
      // Handle Polar API specific error format
      console.error(`Polar API error: ${error.error} - ${error.detail}`);

      // Special handling for ResourceNotFound error
      if (error.error === "ResourceNotFound") {
        console.error(
          `Customer ID "${externalId}" not found in Polar system. This typically means the ID doesn't exist.`,
        );
      }
    }
    throw error;
  }
}
