import { completeService } from "../services/enquiryService.js";

/**
 * Enquiry Controller
 * Handles enquiry status updates and resolutions
 */

/**
 * POST /api/enquiry/resolve
 * Mark enquiry as resolved with specified resolution method
 * Body: { enquiryId, resolutionMethod }
 */
export async function resolveEnquiry(req, res) {
  try {
    const { enquiryId, resolutionMethod } = req.body;

    if (!enquiryId) {
      return res.status(400).json({
        success: false,
        error: "Enquiry ID is required"
      });
    }

    if (!resolutionMethod) {
      return res.status(400).json({
        success: false,
        error: "Resolution method is required"
      });
    }

    const validMethods = ["self-resolved", "agent-online", "agent-physical"];
    if (!validMethods.includes(resolutionMethod)) {
      return res.status(400).json({
        success: false,
        error: `Invalid resolution method. Must be one of: ${validMethods.join(", ")}`
      });
    }

    const updatedEnquiry = await completeService(enquiryId, resolutionMethod);

    res.json({
      success: true,
      message: "Enquiry resolved successfully",
      enquiry: updatedEnquiry
    });
  } catch (error) {
    console.error("Resolve enquiry error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resolve enquiry"
    });
  }
}
