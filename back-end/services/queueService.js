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
 * Join queue for online agent support
 */
export async function joinQueue(customerId, enquiryId, category, subcategory) {
  try {
    // Check if customer already in queue
    const { data: existing } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("customer_id", customerId)
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
          customer_id: customerId,
          enquiry_id: enquiryId,
          status: "waiting",
          position,
          estimated_wait_minutes: estimatedWaitTime,
          joined_at: formatLocalDateTime(new Date())
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
 * Get queue position for customer
 */
export async function getQueuePosition(customerId) {
  try {
    const { data: entry, error } = await supabase
      .from("queue_entries")
      .select("*")
      .eq("customer_id", customerId)
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
export async function leaveQueue(customerId) {
  try {
    const { error } = await supabase
      .from("queue_entries")
      .update({ status: "cancelled", cancelled_at: formatLocalDateTime(new Date()) })
      .eq("customer_id", customerId)
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
 * 
 * Status Flow (per ENQUIRY_STATUS_IMPLEMENTATION):
 * - Enquiry starts as: submitted (when created)
 * - When callback is scheduled: status → in-progress (via startService)
 * - When agent marks resolved: status → resolved, resolution_method → 'agent-online'
 * 
 * This is an agent service (not self-service), so:
 * - Customer CANNOT mark as resolved immediately
 * - Agent MUST mark as resolved after the call completes
 * - Resolution method is always 'agent-online' for callbacks
 */
export async function scheduleCallback(customerId, enquiryId, preferredTime, phoneNumber = null) {
  try {
    // Validate preferred time is in future
    const scheduledTime = new Date(preferredTime);
    if (scheduledTime < new Date()) {
      return { success: false, error: "Please select a future time" };
    }

    // Format datetime in local timezone (without UTC conversion)
    // This ensures 10:00 AM selected = 10:00:00 stored in database
    const formatLocalDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const scheduledTimeLocal = formatLocalDateTime(scheduledTime);

    // Check for existing scheduled callbacks
    const { data: existing } = await supabase
      .from("callbacks")
      .select("*")
      .eq("customer_id", customerId)
      .eq("status", "scheduled")
      .single();

    if (existing) {
      return { success: false, error: "You already have a scheduled callback" };
    }

    // Get customer phone if not provided
    let customerPhone = phoneNumber;
    if (!customerPhone) {
      const { data: customer } = await supabase
        .from("customer")
        .select("mobile_number")
        .eq("customer_id", customerId)
        .single();
      customerPhone = customer?.mobile_number;
    }

    // Validate phone number is present
    if (!customerPhone || customerPhone.trim() === '') {
      return { 
        success: false, 
        error: "Phone number is required. Please provide a contact number for the callback." 
      };
    }

    // Basic phone validation (numbers, spaces, dashes, parentheses, plus)
    const phoneRegex = /^[+]?[0-9\s\-()]+$/;
    if (!phoneRegex.test(customerPhone)) {
      return { 
        success: false, 
        error: "Invalid phone number format. Please use only numbers, spaces, and standard phone symbols." 
      };
    }

    // Create callback entry
    const { data, error } = await supabase
      .from("callbacks")
      .insert([
        {
          customer_id: customerId,
          enquiry_id: enquiryId,
          scheduled_time: scheduledTimeLocal,
          phone_number: customerPhone,
          status: "scheduled",
          created_at: formatLocalDateTime(new Date())
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // ✅ Mark enquiry as in-progress
    // Import startService at top of file if not already imported
    const { startService } = await import("./enquiryService.js");
    await startService(enquiryId);

    // TODO: Agent dashboard will later call:
    // await completeService(enquiryId, "agent-online");

    return {
      success: true,
      callback: data,
      callbackId: data.id,
      scheduledTime: formatScheduledTime(scheduledTime),
      phoneNumber: customerPhone,
      message: `Callback scheduled for ${formatScheduledTime(scheduledTime)}`,
      confirmationCode: generateConfirmationCode()
    };
  } catch (error) {
    console.error("Schedule callback error:", error);
    throw error;
  }
}

/**
 * Format scheduled time for display
 */
function formatScheduledTime(date) {
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  };
  return date.toLocaleString('en-US', options);
}

/**
 * Get customer's callbacks
 */
export async function getUserCallbacks(customerId, status = "scheduled") {
  try {
    const { data, error } = await supabase
      .from("callbacks")
      .select("*")
      .eq("customer_id", customerId)
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
export async function cancelCallback(callbackId, customerId) {
  try {
    const { data: callback } = await supabase
      .from("callbacks")
      .select("*")
      .eq("id", callbackId)
      .eq("customer_id", customerId)
      .single();

    if (!callback) {
      return { success: false, error: "Callback not found" };
    }

    const { error } = await supabase
      .from("callbacks")
      .update({ status: "cancelled", cancelled_at: formatLocalDateTime(new Date()) })
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
 * UX Enhancement: Provide pre-filled options with readable labels
 * Returns array of objects with value (ISO) and label (readable)
 * 
 * Rules:
 * - Starts from TOMORROW (not today)
 * - 7 days from tomorrow
 * - Hourly slots: 9 AM - 5 PM (9:00, 10:00, 11:00... 17:00)
 * - Excludes weekends
 */
export function getCallbackTimeSlots() {
  const slots = [];
  const now = new Date();
  
  // Start from tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Generate slots for 7 days starting from tomorrow
  let daysAdded = 0;
  let dayOffset = 0;

  while (daysAdded < 7) {
    const date = new Date(tomorrow);
    date.setDate(date.getDate() + dayOffset);
    dayOffset++;

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    daysAdded++;

    // Generate hourly time slots from 9 AM to 5 PM
    for (let hour = 9; hour <= 17; hour++) {
      const slotTime = new Date(date);
      slotTime.setHours(hour, 0, 0, 0);
      
      const label = formatTimeSlotLabel(slotTime, now);
      slots.push({
        value: slotTime.toISOString(),
        label: label,
        datetime: slotTime,
        date: slotTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      });
    }
  }

  return slots; // Return all generated slots
}

/**
 * Format time slot with friendly labels (Today, Tomorrow, day name)
 */
function formatTimeSlotLabel(date, now) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const slotDate = new Date(date);
  slotDate.setHours(0, 0, 0, 0);
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (slotDate.getTime() === today.getTime()) {
    return `Today, ${timeStr}`;
  } else if (slotDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${timeStr}`;
  } else {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${dayName}, ${dateStr} at ${timeStr}`;
  }
}
