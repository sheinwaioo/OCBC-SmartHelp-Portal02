import supabase from "../supabaseClient.js";

/**
 * Enquiry Service
 * Manages customer enquiries, history, and flow state
 */

/**
 * Format datetime in local timezone (without UTC conversion)
 * This ensures the time stored matches the local time
 */
function formatLocalDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

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
          status: "submitted",
          created_at: formatLocalDateTime(new Date())
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
 * Only shows resolved enquiries with valid resolution methods
 */
export async function getEnquiryHistory(customerId, limit = 10) {
  try {
    const validMethods = ["self-resolved", "agent-online", "agent-physical"];
    
    const { data, error } = await supabase
      .from("enquiry")
      .select("*")
      .eq("customer_id", customerId)
      .eq("status", "resolved")
      .in("resolution_method", validMethods)
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
    const updateData = {
      status,
      resolution_method: resolutionMethod
    };

    const { data, error } = await supabase
      .from("enquiry")
      .update(updateData)
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

/**
 * Mark enquiry as in-progress when user starts a service
 * Called when: user starts tutorial, generates QR, joins queue, or schedules callback
 */
export async function startService(enquiryId) {
  try {
    const { data, error } = await supabase
      .from("enquiry")
      .update({
        status: "in-progress"
      })
      .eq("enquiry_id", enquiryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Start service error:", error);
    throw error;
  }
}

/**
 * Mark enquiry as resolved with specified resolution method
 * Called when: customer confirms tutorial helped, or agent marks as resolved
 * @param {string} resolutionMethod - 'self-service', 'agent-online', or 'agent-physical'
 */
export async function completeService(enquiryId, resolutionMethod) {
  try {
    const validMethods = ["self-resolved", "agent-online", "agent-physical"];
    if (!validMethods.includes(resolutionMethod)) {
      throw new Error(`Invalid resolution method: ${resolutionMethod}`);
    }

    const { data, error } = await supabase
      .from("enquiry")
      .update({
        status: "resolved",
        resolution_method: resolutionMethod
      })
      .eq("enquiry_id", enquiryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Complete service error:", error);
    throw error;
  }
}
