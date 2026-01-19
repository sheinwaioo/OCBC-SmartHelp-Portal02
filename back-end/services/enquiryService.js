import supabase from "../supabaseClient.js";

/**
 * Enquiry Service
 * Manages customer enquiries, history, and flow state
 */

/**
 * Create new enquiry in Team's schema
 * Maps category name to category_id via enquiry_category table
 */
export async function createEnquiry(customerId, categoryName, subcategoryName) {
  try {
    // Find category_id by matching subcategoryName in enquiry_category
    // Use case-insensitive search since database may have different casing
    const { data: allCategories, error: fetchError } = await supabase
      .from("enquiry_category")
      .select("enquiry_category_id, name");

    if (fetchError) {
      console.error("Category fetch error:", fetchError.message);
      throw fetchError;
    }

    // Find matching category (case-insensitive)
    const categoryData = allCategories?.find(cat => 
      cat.name.toLowerCase() === subcategoryName.toLowerCase()
    );

    if (!categoryData) {
      console.error("Category not found:", subcategoryName);
      console.error("Available categories:", allCategories?.map(c => c.name).join(", "));
      throw new Error(`Category not found: ${subcategoryName}`);
    }

    const { data, error } = await supabase
      .from("enquiry")
      .insert([
        {
          customer_id: customerId,
          category_id: categoryData.enquiry_category_id,
          description: `${categoryName} - ${subcategoryName}`,
          status: "open",
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert enquiry error:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Create enquiry error:", error.message);
    throw error;
  }
}

/**
 * Get enquiry history for customer
 */
export async function getEnquiryHistory(customerId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("enquiry")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get enquiry history error:", error);
    return [];
  }
}

/**
 * Update enquiry status
 */
export async function updateEnquiryStatus(enquiryId, status, resolutionMethod = null) {
  try {
    const { data, error } = await supabase
      .from("enquiry")
      .update({
        status,
        resolution_method: resolutionMethod,
        created_at: new Date()
      })
      .eq("enquiry_id", enquiryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Update enquiry error:", error);
    throw error;
  }
}

/**
 * Get single enquiry
 */
export async function getEnquiry(enquiryId) {
  try {
    const { data, error } = await supabase
      .from("enquiry")
      .select("*")
      .eq("enquiry_id", enquiryId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get enquiry error:", error);
    throw error;
  }
}
