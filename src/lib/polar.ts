import { Polar } from "@polar-sh/sdk";

// Initialize the Polar client
export const polar = new Polar({
  accessToken: import.meta.env.VITE_POLAR_ACCESS_TOKEN ?? "",
});

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
