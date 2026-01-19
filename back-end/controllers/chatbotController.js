
import dotenv from "dotenv";
dotenv.config();

import {
  classifyIntent,
  getFlowStep,
  mapSelection,
  getAssistanceDetails,
  CATEGORIES,
  SUBCATEGORIES
} from "../services/intentEngine.js";
import {
  createEnquiry,
  updateEnquiryStatus,
  getEnquiryHistory
} from "../services/enquiryService.js";
import {
  joinQueue,
  getQueuePosition,
  getCallbackTimeSlots,
  scheduleCallback,
  leaveQueue
} from "../services/queueService.js";
import {
  generateConsultationQR,
  getAvailableBranches
} from "../services/consultationService.js";

/**
 * Main Chatbot Controller
 * Orchestrates intelligent intent classification and structured flows
 * 
 * Request body should include:
 * - message: User input
 * - flowState: Current conversation state (category, subcategory, step, enquiryId, isLoggedIn)
 */
export async function chatWithAI(req, res) {
  try {
    const { message, flowState = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const customerId = req.user?.userId; // From auth middleware
    const isLoggedIn = !!customerId;

    // Classify intent from user message
    const intent = await classifyIntent(message);

    // Initialize or continue flow
    let newState = {
      ...flowState,
      isLoggedIn
    };

    let response = {
      message: "",
      nextStep: null,
      options: [],
      suggestedAction: null,
      requiresLogin: false,
      flowState: newState
    };

    // Step 1: Detect category from intent
    if (!newState.category) {
      newState.category = intent.category;
      newState.confidence = intent.confidence;
    }

    // Handle greetings specifically
    if (intent.isGreeting) {
      response.message = "Hello! 👋 Welcome to OCBC SmartHelp. I'm here to assist you with your banking inquiries. What can I help you with today?";
      response.suggestedAction = "select_category";
      response.options = Object.values(CATEGORIES).map(cat => ({
        text: cat,
        value: cat
      }));
      response.flowState = newState;
      res.json(response);
      return;
    }

    // Step 2: Detect or prompt for subcategory
    // Don't auto-detect - always let user choose explicitly
    if (!newState.subcategory && newState.category !== "unknown") {
      // Store detected subcategory for later use if needed
      if (intent.subcategory && intent.confidence > 0.7) {
        newState.detectedSubcategory = intent.subcategory;
      }
    }

    // Step 3: Generate response based on current flow state
    let flowStep = getFlowStep(newState.category, newState.subcategory);

    // Create enquiry if identified (use customer_id if logged in)
    if (newState.category && newState.subcategory && !newState.enquiryId && isLoggedIn) {
      try {
        const enquiry = await createEnquiry(customerId, newState.category, newState.subcategory);
        newState.enquiryId = enquiry?.enquiry_id;
      } catch (error) {
        console.error("Failed to create enquiry:", error);
      }
    }

    // Check for assistance selection requests
    if (message.toLowerCase().includes("tutorial") || message.toLowerCase().includes("self-service")) {
      response.suggestedAction = "view_tutorial";
      response.options = [
        { text: "Step 1: Access Settings", value: "step_1" },
        { text: "Step 2: Select Your Option", value: "step_2" },
        { text: "Step 3: Complete Request", value: "step_3" },
        { text: "Still Need Help?", value: "escalate" }
      ];
      response.message = "Here are the steps to help you:";
    } else if (message.toLowerCase().includes("physical") || message.toLowerCase().includes("branch")) {
      if (!isLoggedIn) {
        response.requiresLogin = true;
        response.message = "Please log in to schedule a physical consultation.";
      } else {
        response.suggestedAction = "schedule_consultation";
        response.options = getAvailableBranches().map(branch => ({
          text: branch.name,
          value: branch.name,
          distance: branch.distance
        }));
        response.message = "Select your preferred OCBC branch:";
      }
    } else if (message.toLowerCase().includes("agent") || message.toLowerCase().includes("support") || message.toLowerCase().includes("queue")) {
      if (!isLoggedIn) {
        response.requiresLogin = true;
        response.message = "Please log in to connect with an online agent.";
      } else {
        response.suggestedAction = "join_queue_or_callback";
        response.options = [
          { text: "Join Queue Now", value: "join_queue" },
          { text: "Schedule Callback", value: "schedule_callback" }
        ];
        response.message = "How would you like to proceed?";
      }
    } else if (message.toLowerCase().includes("queue")) {
      if (isLoggedIn) {
        const queuePos = await getQueuePosition(customerId);
        if (queuePos) {
          response.message = `You are in position ${queuePos.position}. Estimated wait time: ${queuePos.estimatedWaitTime} minutes.`;
          response.options = [
            { text: "Continue Waiting", value: "continue_queue" },
            { text: "Leave Queue & Schedule Callback", value: "leave_and_callback" }
          ];
        }
      }
    } else if (message.toLowerCase().includes("callback")) {
      if (!isLoggedIn) {
        response.requiresLogin = true;
        response.message = "Please log in to schedule a callback.";
      } else {
        const slots = getCallbackTimeSlots();
        response.suggestedAction = "select_callback_time";
        response.options = slots.slice(0, 6).map(slot => ({
          text: new Date(slot).toLocaleString(),
          value: slot
        }));
        response.message = "When would you like us to call you?";
      }
    } else if (message.toLowerCase().includes("history")) {
      if (!isLoggedIn) {
        response.requiresLogin = true;
        response.message = "Please log in to view your enquiry history.";
      } else {
        try {
          const history = await getEnquiryHistory(userId, 5);
          response.message = `Your recent enquiries (${history.length}):`;
          response.options = history.map(e => ({
            text: `${e.category} - ${e.subcategory}`,
            value: e.id,
            date: e.created_at
          }));
        } catch (error) {
          response.message = "Unable to fetch your enquiry history.";
        }
      }
    } else if (!newState.category || newState.category === "unknown") {
      // Initial state or unknown intent - prompt for category
      response.message = "Welcome to OCBC SmartHelp! How can I help you today?";
      response.suggestedAction = "select_category";
      response.options = Object.values(CATEGORIES).map(cat => ({
        text: cat,
        value: cat
      }));
    } else if (newState.category && !newState.subcategory) {
      // Show subcategories
      const categoryKey = newState.category
        .replace(" & ", "_")
        .replace(/ /g, "_")
        .toUpperCase();
      const subs = SUBCATEGORIES[categoryKey] || {};
      response.message = `You selected ${newState.category}. What specifically do you need help with?`;
      response.suggestedAction = "select_subcategory";
      response.options = Object.values(subs).map(sub => ({
        text: sub,
        value: sub
      }));
    } else if (newState.category && newState.subcategory) {
      // Show assistance options
      response.message = `Great! I can help you with: ${newState.subcategory}\n\nHow would you like to proceed?`;
      response.suggestedAction = "select_assistance";
      response.options = [
        { text: "View Tutorial", value: "view_tutorial" },
        { text: "Physical Consultation", value: "physical_consultation" },
        { text: "Online Agent Support", value: "online_agent" }
      ];
    }

    response.flowState = newState;

    res.json(response);
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      error: "Chatbot service error",
      message: "I'm experiencing technical difficulties. Please try again later."
    });
  }
}

/**
 * Handle consultation QR code request
 */
export async function requestConsultationQR(req, res) {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      return res.status(401).json({ error: "Login required" });
    }

    let { enquiryId, branch, category, subcategory } = req.body;

    // If no enquiryId provided, create one now
    if (!enquiryId) {
      if (!category || !subcategory) {
        return res.status(400).json({ error: "Category and subcategory are required" });
      }
      
      try {
        const enquiry = await createEnquiry(customerId, category, subcategory);
        enquiryId = enquiry.enquiry_id;
      } catch (err) {
        console.error("Failed to create enquiry:", err);
        return res.status(500).json({ error: "Failed to create enquiry" });
      }
    }

    const result = await generateConsultationQR(customerId, enquiryId, branch);
    res.json(result);
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({ error: "Failed to generate QR code", details: error.message });
  }
}

/**
 * Handle queue operations
 */
export async function handleQueueAction(req, res) {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      return res.status(401).json({ error: "Login required" });
    }

    const { action, enquiryId } = req.body;

    if (action === "join") {
      const result = await joinQueue(customerId, enquiryId, "", "");
      return res.json(result);
    } else if (action === "leave") {
      const result = await leaveQueue(customerId);
      return res.json(result);
    } else if (action === "position") {
      const position = await getQueuePosition(customerId);
      return res.json({ queuePosition: position });
    }

    res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Queue action error:", error);
    res.status(500).json({ error: "Queue operation failed" });
  }
}

/**
 * Handle callback scheduling
 */
export async function handleCallbackRequest(req, res) {
  try {
    const customerId = req.user?.userId;
    if (!customerId) {
      return res.status(401).json({ error: "Login required" });
    }

    const { enquiryId, preferredTime, phoneNumber } = req.body;

    if (!enquiryId || !preferredTime) {
      return res.status(400).json({ error: "Enquiry ID and preferred time are required" });
    }

    const result = await scheduleCallback(customerId, enquiryId, preferredTime, phoneNumber);
    res.json(result);
  } catch (error) {
    console.error("Callback request error:", error);
    res.status(500).json({ error: "Failed to schedule callback" });  }
}