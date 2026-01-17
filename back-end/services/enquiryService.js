import supabase from "../supabaseClient.js";

/**
 * Enquiry Service
 * Manages customer enquiries, history, and flow state
 */

/**
 * Create new enquiry
 */
export async function createEnquiry(userId, category, subcategory) {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .insert([
        {
          user_id: userId,
          category,
          subcategory,
          status: "open",
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Create enquiry error:", error);
    throw error;
  }
}

/**
 * Get enquiry history for user
 */
export async function getEnquiryHistory(userId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .eq("user_id", userId)
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
export async function updateEnquiryStatus(enquiryId, status, details = {}) {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .update({
        status,
        details: JSON.stringify(details),
        updated_at: new Date()
      })
      .eq("id", enquiryId)
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
      .from("enquiries")
      .select("*")
      .eq("id", enquiryId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get enquiry error:", error);
    throw error;
  }
}
