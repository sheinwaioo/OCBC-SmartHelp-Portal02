import supabase from "../supabaseClient.js";

/**
 * Queue & Callback Service
 * Manages online support queue and callback scheduling
 * 
 * UX Refinements:
 * - Show estimated wait time based on queue length
 * - Display user's queue position
 * - Allow graceful cancellation with alternative options
 * - Offer callback scheduling as preferred option
 */

const AVG_HANDLING_TIME_MINUTES = 8; // Average agent handling time

/**
 * Join queue for online agent support
 */
export async function joinQueue(userId, enquiryId, category, subcategory) {
  try {
    // Check if user already in queue
    const { data: existing } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "waiting")
      .single();

    if (existing) {
      return { success: false, error: "Already in queue", queueEntry: existing };
    }

    // Get current queue length
    const { count } = await supabase
      .from("queue_entries")
      .select("*", { count: "exact" })
      .eq("status", "waiting");

    const position = (count || 0) + 1;
    const estimatedWaitTime = position * AVG_HANDLING_TIME_MINUTES;

    // Insert queue entry
    const { data, error } = await supabase
      .from("queue_entries")
      .insert([
        {
          user_id: userId,
          enquiry_id: enquiryId,
          status: "waiting",
          position,
          estimated_wait_minutes: estimatedWaitTime,
          joined_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      queueEntry: data,
      position,
      estimatedWaitTime
    };
  } catch (error) {
    console.error("Join queue error:", error);
    throw error;
  }
}

/**
 * Get queue position for user
 */
export async function getQueuePosition(userId) {
  try {
    const { data: entry, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "waiting")
      .single();

    if (error || !entry) {
      return null;
    }

    // Recalculate position in case queue changed
    const { count } = await supabase
      .from("queue_entries")
      .select("*", { count: "exact" })
      .eq("status", "waiting")
      .lt("joined_at", entry.joined_at);

    const currentPosition = (count || 0) + 1;
    const estimatedWaitTime = currentPosition * AVG_HANDLING_TIME_MINUTES;

    return {
      ...entry,
      position: currentPosition,
      estimatedWaitTime
    };
  } catch (error) {
    console.error("Get queue position error:", error);
    return null;
  }
}

/**
 * Leave queue
 */
export async function leaveQueue(userId) {
  try {
    const { error } = await supabase
      .from("queue_entries")
      .update({ status: "cancelled", cancelled_at: new Date() })
      .eq("user_id", userId)
      .eq("status", "waiting");

    if (error) throw error;

    return {
      success: true,
      message: "You have left the queue",
      alternatives: [
        "Schedule a callback",
        "View self-service tutorials",
        "Request physical consultation"
      ]
    };
  } catch (error) {
    console.error("Leave queue error:", error);
    throw error;
  }
}

/**
 * Schedule callback
 * UX Refinement: Offer preferred time slots
 */
export async function scheduleCallback(userId, enquiryId, preferredTime, phoneNumber = null) {
  try {
    // Validate preferred time is in future
    const scheduledTime = new Date(preferredTime);
    if (scheduledTime < new Date()) {
      return { success: false, error: "Please select a future time" };
    }

    // Check for existing scheduled callbacks
    const { data: existing } = await supabase
      .from("callbacks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "scheduled")
      .single();

    if (existing) {
      return { success: false, error: "You already have a scheduled callback" };
    }

    // Get user phone if not provided
    let userPhone = phoneNumber;
    if (!userPhone) {
      const { data: user } = await supabase
        .from("users")
        .select("phone_number")
        .eq("id", userId)
        .single();
      userPhone = user?.phone_number;
    }

    // Create callback entry
    const { data, error } = await supabase
      .from("callbacks")
      .insert([
        {
          user_id: userId,
          enquiry_id: enquiryId,
          scheduled_time: scheduledTime,
          phone_number: userPhone,
          status: "scheduled",
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      callback: data,
      message: `Callback scheduled for ${scheduledTime.toLocaleString()}`,
      confirmationCode: generateConfirmationCode()
    };
  } catch (error) {
    console.error("Schedule callback error:", error);
    throw error;
  }
}

/**
 * Get user's callbacks
 */
export async function getUserCallbacks(userId, status = "scheduled") {
  try {
    const { data, error } = await supabase
      .from("callbacks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", status)
      .order("scheduled_time", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get callbacks error:", error);
    return [];
  }
}

/**
 * Cancel callback
 */
export async function cancelCallback(callbackId, userId) {
  try {
    const { data: callback } = await supabase
      .from("callbacks")
      .select("*")
      .eq("id", callbackId)
      .eq("user_id", userId)
      .single();

    if (!callback) {
      return { success: false, error: "Callback not found" };
    }

    const { error } = await supabase
      .from("callbacks")
      .update({ status: "cancelled", cancelled_at: new Date() })
      .eq("id", callbackId);

    if (error) throw error;

    return {
      success: true,
      message: "Callback cancelled successfully"
    };
  } catch (error) {
    console.error("Cancel callback error:", error);
    throw error;
  }
}

/**
 * Helper: Generate confirmation code
 */
function generateConfirmationCode() {
  return "CB" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

/**
 * Get available callback time slots
 * UX Enhancement: Provide pre-filled options
 */
export function getCallbackTimeSlots() {
  const slots = [];
  const now = new Date();

  // Generate slots for next 7 days, business hours (9 AM - 6 PM)
  for (let day = 1; day <= 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (let hour = 9; hour < 18; hour += 2) {
      date.setHours(hour, 0, 0, 0);
      if (date > now) {
        slots.push(date.toISOString());
      }
    }
  }

  return slots.slice(0, 12); // Return first 12 available slots
}
