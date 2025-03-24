import { supabase } from "./supabase-client";

// Log that we're using the shared client
console.log("Customer module using shared Supabase client instance");

/**
 * Get customer by email
 * @param email The customer's email address
 * @returns The customer record or null if not found
 */
export async function getCustomerByEmail(email: string) {
  try {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return null;
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Error fetching customer:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCustomerByEmail:", error);
    return null;
  }
}

/**
 * Get projects by customer email
 * @param email The customer's email address
 * @returns Array of projects belonging to the customer
 */
export async function getProjectsByCustomerEmail(email: string) {
  try {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return [];
    }

    // First get the customer ID
    const customer = await getCustomerByEmail(email);
    if (!customer) return [];

    // Then get all projects for this customer
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error("Error fetching customer projects:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProjectsByCustomerEmail:", error);
    return [];
  }
}

/**
 * Get all purchases by customer email
 * @param email The customer's email address
 * @returns Array of purchases (checkouts) made by the customer
 */
export async function getPurchasesByCustomerEmail(email: string) {
  try {
    if (!supabase) {
      console.error("Supabase client not initialized");
      return [];
    }

    // First get the customer ID
    const customer = await getCustomerByEmail(email);
    if (!customer) return [];

    // Then get all checkouts for this customer
    const { data, error } = await supabase
      .from("polar_checkouts")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error("Error fetching customer purchases:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getPurchasesByCustomerEmail:", error);
    return [];
  }
}
