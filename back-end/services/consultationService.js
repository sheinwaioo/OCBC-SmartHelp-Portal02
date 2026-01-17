import supabase from "../supabaseClient.js";
import QRCode from "qrcode";

/**
 * Physical Consultation Service
 * Manages QR code generation and consultation booking
 * 
 * UX Features:
 * - Generate unique QR code for each consultation booking
 * - Allow user to save/download QR code
 * - Track consultation feedback
 * - Login required
 */

/**
 * Generate QR code data and create consultation booking
 * Generates actual QR code image with consultation details
 */
export async function generateConsultationQR(userId, enquiryId, preferredBranch = null) {
  try {
    // Generate unique consultation ID with ENQ prefix
    const timestamp = Date.now().toString().slice(-4);
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const consultationId = `ENQ-${timestamp}-${randomPart}`;

    // QR code encodes a scannable URL with token (for real-world use)
    // Format: https://ocbc-smarthelp.sg/branch/check-in?token=ENQ-XXXX-XXX
    const qrUrl = `https://ocbc-smarthelp.sg/branch/check-in?token=${consultationId}`;

    // Store full data for reference
    const qrData = {
      consultationId,
      userId,
      timestamp: new Date().toISOString(),
      branch: preferredBranch || "Main Branch",
      url: qrUrl
    };

    // Generate REAL, SCANNABLE QR code as PNG data URL
    // The QR code encodes the URL, which can be scanned by any phone camera
    const qrCodeDataUrl = await QRCode.toDataURL(
      qrUrl,
      {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.95,
        margin: 1,
        width: 300
      }
    );

    // Create consultation booking
    const { data, error } = await supabase
      .from("consultations")
      .insert([
        {
          user_id: userId,
          enquiry_id: enquiryId,
          consultation_id: consultationId,
          qr_data: JSON.stringify(qrData),
          qr_code_image: qrCodeDataUrl,
          preferred_branch: preferredBranch || "Main Branch",
          status: "scheduled",
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      consultation: data,
      consultationId: consultationId,
      qrCode: qrCodeDataUrl,
      branch: preferredBranch || "Main Branch",
      instructions: [
        "Scan or show this QR code at your OCBC branch",
        "Expected wait time: 5-10 minutes from check-in",
        "Bring a valid ID for verification",
        "Code valid for 7 working days"
      ]
    };
  } catch (error) {
    console.error("Generate consultation QR error:", error);
    throw error;
  }
}

/**
 * Get consultation details
 */
export async function getConsultation(consultationId) {
  try {
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("id", consultationId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get consultation error:", error);
    throw error;
  }
}

/**
 * Get user's consultations
 */
export async function getUserConsultations(userId) {
  try {
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get user consultations error:", error);
    return [];
  }
}

/**
 * Submit consultation feedback
 */
export async function submitConsultationFeedback(consultationId, userId, feedback) {
  try {
    const { data, error } = await supabase
      .from("consultations")
      .update({
        feedback: feedback.message,
        rating: feedback.rating,
        status: "completed",
        completed_at: new Date()
      })
      .eq("id", consultationId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Thank you for your feedback!",
      consultation: data
    };
  } catch (error) {
    console.error("Submit feedback error:", error);
    throw error;
  }
}

/**
 * Get available branches
 * UX Enhancement: Return with distance/accessibility info
 */
export function getAvailableBranches() {
  return [
    {
      name: "Main Branch - CBD",
      address: "50 Chulia Street, Singapore 049401",
      hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-2PM",
      distance: "0.2km",
      accessibility: "Wheelchair accessible"
    },
    {
      name: "Tampines Branch",
      address: "3 Tampines Central 1, Singapore 529540",
      hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-2PM",
      distance: "4.5km",
      accessibility: "Wheelchair accessible"
    },
    {
      name: "Orchard Branch",
      address: "1 Orchard Road, Singapore 238801",
      hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-2PM",
      distance: "2.1km",
      accessibility: "Wheelchair accessible"
    },
    {
      name: "Jurong East Branch",
      address: "133 Jurong Gateway Road, Singapore 600133",
      hours: "Mon-Fri: 9AM-6PM, Sat: 10AM-2PM",
      distance: "12.3km",
      accessibility: "Wheelchair accessible"
    }
  ];
}
