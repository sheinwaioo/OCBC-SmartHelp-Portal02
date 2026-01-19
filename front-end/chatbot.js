/**
 * Chatbot Module for OCBC SmartHelp
 * Handles intelligent conversation flows and user interactions
 */

let chatFlowState = {
  category: null,
  subcategory: null,
  enquiryId: null,
  step: "initial",
  isLoggedIn: false
};

let lastQRData = null; // Store QR data for modal display
let chatbotInitialized = false; // Flag to prevent duplicate initialization

/**
 * Initialize chatbot on page load
 */
function initChatbot() {
  // Guard: Only initialize once
  if (chatbotInitialized) {
    return;
  }
  
  const sendBtn = document.getElementById("send-btn");
  const userInput = document.getElementById("user-input");
  const chatMessages = document.getElementById("chat-messages");

  // Send message on button click
  sendBtn?.addEventListener("click", () => sendChatMessage());

  // Send message on Enter key
  userInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });

  // Mark as initialized FIRST to prevent re-entry
  chatbotInitialized = true;

  // Show initial greeting only if chat is empty
  const chatMessagesContainer = document.getElementById("chat-messages");
  if (chatMessagesContainer && chatMessagesContainer.children.length === 0) {
    // Add initial message without delay
    addBotMessage("Hello! 👋 Welcome to OCBC SmartHelp. I'm here to assist you with your banking inquiries. What can I help you with today?");
    showQuickReplies([
      "Card Services",
      "Account & Banking",
      "Check Enquiry History",
      "View Available Consultations"
    ]);
  }
}

/**
 * Send chat message and get response
 */
async function sendChatMessage() {
  const userInput = document.getElementById("user-input");
  const message = userInput.value.trim();

  if (!message) return;

  // Add user message to UI
  addUserMessage(message);
  userInput.value = "";

  // Update flow state
  chatFlowState.isLoggedIn = isLoggedIn();

  try {
    // Send to backend
    const response = await apiCall("/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        flowState: chatFlowState
      })
    });

    // Update flow state from response
    if (response.flowState) {
      chatFlowState = { ...chatFlowState, ...response.flowState };
    }

    // Handle special actions
    if (response.requiresLogin) {
      promptLogin("To access this feature");
      addBotMessage(response.message);
      return;
    }

    // Display bot response
    addBotMessage(response.message);

    // Show quick action buttons or options
    if (response.options && response.options.length > 0) {
      showOptionsButtons(response.options, response.suggestedAction);
    }

    // Handle specific actions
    if (response.suggestedAction) {
      handleSuggestedAction(response.suggestedAction, response.options);
    }
  } catch (error) {
    addBotMessage("I encountered an error processing your request. Please try again.");
    console.error("Chat error:", error);
  }
}

/**
 * Handle suggested action from bot
 */
function handleSuggestedAction(action, options = []) {
  switch (action) {
    case "select_category":
      // Category selection already handled by buttons
      break;

    case "select_subcategory":
      // Subcategory selection already handled by buttons
      break;

    case "select_assistance":
      // Assistance selection handled by buttons
      break;

    case "view_tutorial":
      addBotMessage("📚 Here are the recommended steps for your inquiry:");
      break;

    case "join_queue_or_callback":
      // Options already shown
      break;

    case "schedule_consultation":
      // Show branch selection modal after option selected
      break;

    case "select_callback_time":
      // Time slots already shown as buttons
      break;

    default:
      // No special handling needed
      break;
  }
}

/**
 * Show quick reply buttons
 */
function showQuickReplies(replies) {
  const chatMessages = document.getElementById("chat-messages");
  
  const quickRepliesContainer = document.createElement("div");
  quickRepliesContainer.className = "quick-replies";

  replies.forEach(reply => {
    const button = createButton(reply, reply);
    
    // Handle "View QR Code" specially
    if (reply === "View QR Code" || reply === "Download QR Code") {
      button.addEventListener("click", () => {
        if (lastQRData) {
          showQRCodeModal(lastQRData);
        } else {
          alert("No QR code available. Please complete a consultation booking first.");
        }
      });
    } else {
      button.addEventListener("click", () => {
        const userInput = document.getElementById("user-input");
        userInput.value = reply;
        sendChatMessage();
      });
    }
    quickRepliesContainer.appendChild(button);
  });

  chatMessages.appendChild(quickRepliesContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Show option buttons from bot response
 */
function showOptionsButtons(options, action) {
  const chatMessages = document.getElementById("chat-messages");
  const optionsContainer = document.createElement("div");
  optionsContainer.className = "chat-options";

  options.forEach(option => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = option.text || option;
    button.value = option.value || option;

    button.addEventListener("click", () => {
      handleOptionSelected(option, action);
    });

    optionsContainer.appendChild(button);
  });

  chatMessages.appendChild(optionsContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Handle option selection
 */
async function handleOptionSelected(option, action) {
  const optionText = option.text || option;
  const optionValue = option.value || option;

  // Add selected option to chat
  addUserMessage(optionText);

  // Remove option buttons
  const optionsContainers = document.querySelectorAll(".chat-options");
  optionsContainers.forEach(container => container.remove());

  try {
    // Handle different actions
    if (action === "select_category") {
      chatFlowState.category = optionValue;
      // Send continuation message
      const message = `I'd like to help you with ${optionValue}. What specifically do you need?`;
      sendChatMessage_Internal(message);
    } else if (action === "select_subcategory") {
      chatFlowState.subcategory = optionValue;
      const message = `Great! ${optionValue}. How would you like to proceed?`;
      sendChatMessage_Internal(message);
    } else if (action === "select_assistance") {
      handleAssistanceSelection(optionValue);
    } else if (action === "view_tutorial") {
      handleTutorialStep(optionValue);
    } else if (action === "join_queue_or_callback") {
      handleQueueOrCallback(optionValue);
    } else if (action === "select_callback_time") {
      handleCallbackTimeSelection(optionValue);
    } else if (action === "physical_consultation") {
      handleBranchSelection(optionValue);
    }
  } catch (error) {
    console.error("Option handling error:", error);
    addBotMessage("I encountered an error. Please try again.");
  }
}

/**
 * Handle assistance selection (Tutorial, Consultation, Agent)
 */
async function handleAssistanceSelection(option) {
  if (option === "view_tutorial") {
    addBotMessage("📚 Here are the step-by-step instructions for your inquiry:");
    addBotMessage("Step 1: Open your OCBC mobile app\nStep 2: Navigate to the relevant section\nStep 3: Follow the on-screen prompts\n\nWould you like more detailed help or prefer to speak with an agent?");
    showQuickReplies(["Speak with Agent", "Schedule Callback", "Go Back"]);
  } else if (option === "physical_consultation") {
    if (!promptLogin("To schedule a physical consultation")) return;
    addBotMessage("Great! Let's schedule your consultation at an OCBC branch.");
    displayBranchSelection();
  } else if (option === "online_agent") {
    if (!promptLogin("To connect with an online agent")) return;
    addBotMessage("How would you like to proceed?");
    showQuickReplies(["Join Queue Now", "Schedule Callback", "Go Back"]);
  }
}

/**
 * Display branch selection dropdown
 */
function displayBranchSelection() {
  const branches = [
    { name: "Main Branch - CBD" },
    { name: "Tampines Branch" },
    { name: "Orchard Branch" },
    { name: "Jurong East Branch" }
  ];

  showBranchDropdown(branches);
}

/**
 * Show branch selection as a dropdown
 */
function showBranchDropdown(branches) {
  const chatMessages = document.getElementById("chat-messages");
  
  // Create container for label and dropdown
  const container = document.createElement("div");
  container.className = "branch-selection-container";
  
  // Create label
  const label = document.createElement("label");
  label.className = "branch-selection-label";
  label.textContent = "Select your preferred branch:";
  
  // Create dropdown
  const select = document.createElement("select");
  select.className = "branch-dropdown";
  select.id = "branch-select-dropdown";
  
  // Add placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "-- Choose a branch --";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);
  
  // Add branch options
  branches.forEach(branch => {
    const option = document.createElement("option");
    option.value = branch.name;
    option.textContent = branch.name;
    select.appendChild(option);
  });
  
  // Add change event listener
  select.addEventListener("change", (e) => {
    if (e.target.value) {
      handleBranchSelection(e.target.value);
      // Disable dropdown after selection to prevent re-selection
      select.disabled = true;
    }
  });
  
  container.appendChild(label);
  container.appendChild(select);
  chatMessages.appendChild(container);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Focus on dropdown for better UX
  select.focus();
}

/**
 * Handle branch selection
 */
async function handleBranchSelection(branchName) {
  try {
    addBotMessage(`Generating your consultation QR code for ${branchName}...`);

    const response = await apiCall("/consultations/qr", {
      method: "POST",
      body: JSON.stringify({
        enquiryId: chatFlowState.enquiryId,
        branch: branchName,
        category: chatFlowState.category,
        subcategory: chatFlowState.subcategory
      })
    });

    if (response.success) {
      // Store QR data for modal display
      lastQRData = {
        consultationId: response.consultationId,
        qrCode: response.qrCode,
        branch: response.branch,
        instructions: response.instructions
      };

      addBotMessage("✅ Your consultation has been scheduled!");
      addBotMessage(`Consultation ID: ${response.consultationId}`);
      addBotMessage("Your priority queue ticket is ready. You can download it or view it anytime.");

      showQuickReplies(["View QR Code", "Schedule Another Consultation", "Go Back"]);
    }
  } catch (error) {
    addBotMessage("Failed to generate consultation QR code. Please try again.");
    console.error("Branch selection error:", error);
  }
}

/**
 * Handle queue or callback selection
 */
async function handleQueueOrCallback(option) {
  if (option === "join_queue") {
    try {
      addBotMessage("Joining queue...");
      const response = await apiCall("/queue/join", {
        method: "POST",
        body: JSON.stringify({
          action: "join",
          enquiryId: chatFlowState.enquiryId
        })
      });

      if (response.success) {
        addBotMessage(`✅ You've been added to the queue!\n\nPosition: #${response.position}\nEstimated wait time: ${response.estimatedWaitTime} minutes`);
        showQuickReplies(["Check Queue Status", "Leave Queue & Schedule Callback", "Go Back"]);
      }
    } catch (error) {
      addBotMessage("Failed to join queue. Please try again.");
    }
  } else if (option === "schedule_callback") {
    displayCallbackTimeSlots();
  }
}

/**
 * Display callback time slots
 */
function displayCallbackTimeSlots() {
  addBotMessage("When would you like us to call you?");

  const slots = [
    "Today, 2:00 PM",
    "Today, 3:00 PM",
    "Tomorrow, 10:00 AM",
    "Tomorrow, 2:00 PM",
    "Next Monday, 10:00 AM"
  ];

  showQuickReplies(slots);
}

/**
 * Handle callback time selection
 */
async function handleCallbackTimeSelection(timeSlot) {
  try {
    addBotMessage(`Scheduling callback for ${timeSlot}...`);

    const response = await apiCall("/callbacks/schedule", {
      method: "POST",
      body: JSON.stringify({
        enquiryId: chatFlowState.enquiryId,
        preferredTime: new Date().toISOString()
      })
    });

    if (response.success) {
      addBotMessage(`✅ Callback scheduled successfully!\n\nConfirmation code: ${response.confirmationCode}\n\nWe'll call you at ${timeSlot}`);
      showQuickReplies(["View More Help", "Go Back", "End Chat"]);
    }
  } catch (error) {
    addBotMessage("Failed to schedule callback. Please try again.");
  }
}

/**
 * Handle tutorial step
 */
function handleTutorialStep(step) {
  const tutorials = {
    "step_1": "Open your OCBC mobile app and tap on 'Settings' at the bottom of the screen.",
    "step_2": "Select the section relevant to your inquiry (Cards, Accounts, Loans, etc.)",
    "step_3": "Follow the on-screen instructions to complete your request.",
    "escalate": "Would you like to speak with an agent? I can help connect you."
  };

  addBotMessage(tutorials[step] || "Here's how to proceed with your inquiry.");
  showQuickReplies(["Next Step", "Speak with Agent", "Go Back"]);
}

/**
 * Internal message sending (for flow continuation)
 */
function sendChatMessage_Internal(message) {
  const userInput = document.getElementById("user-input");
  userInput.value = message;
  sendChatMessage();
}

/**
 * Add user message to chat
 */
function addUserMessage(text) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message user";
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Add bot message to chat
 */
function addBotMessage(text) {
  const chatMessages = document.getElementById("chat-messages");
  
  const messageDiv = document.createElement("div");
  messageDiv.className = "chat-message ai";
  messageDiv.innerHTML = formatChatText(text);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Format chat text for display
 */
function formatChatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

/**
 * Display QR Code Modal - REFACTORED FOR CLARITY
 * Primary focus: QR code with clear instructions
 * Secondary: Consultation details below
 * Designed for elderly/non-technical users
 */
function showQRCodeModal(qrData) {
  const modal = document.getElementById("qr-modal");
  const qrCode = document.getElementById("qr-code");
  const qrDetails = document.getElementById("qr-details");
  const qrInstructions = document.getElementById("qr-instructions");
  
  // Store QR data globally for download function
  window.lastQRData = qrData;
  
  // Calculate expiry date (7 days from now)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);
  const expiryFormatted = expiryDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  
  // LEFT COLUMN: QR CODE IMAGE
  qrCode.innerHTML = `
    <div class="qr-code-wrapper">
      <img 
        src="${qrData.qrCode}" 
        alt="Consultation QR code" 
        class="qr-image-landscape"
        width="280"
        height="280"
      />
      <p class="qr-scan-instruction">Scan this QR code at your OCBC branch</p>
    </div>
  `;
  
  // RIGHT COLUMN: CONSULTATION DETAILS
  qrDetails.innerHTML = `
    <div class="qr-details-section">
      <h3 class="qr-title">Your Consultation</h3>
      
      <div class="qr-info-block">
        <div class="info-row">
          <span class="info-label">Consultation ID</span>
          <span class="info-value" id="detail-id">${qrData.consultationId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Branch Location</span>
          <span class="info-value">${qrData.branch}</span>
        </div>
      </div>
      
      <div class="qr-validity-badge">
        <span class="validity-label">Valid for:</span>
        <span class="validity-text">7 working days until ${expiryFormatted}</span>
      </div>
    </div>
  `;
  
  // COLLAPSIBLE: HOW TO USE
  if (qrData.instructions && qrData.instructions.length > 0) {
    qrInstructions.innerHTML = `
      <ol class="qr-instructions-list">
        ${qrData.instructions.map(inst => `<li>${inst}</li>`).join("")}
      </ol>
    `;
  }
  
  // Attach download handler
  const downloadBtn = document.getElementById("download-qr-btn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      downloadQRCode(qrData);
    });
  }
  
  // Attach toggle handler for instructions
  const toggleBtn = document.getElementById("qr-instructions-toggle");
  const instructionsContent = document.getElementById("qr-instructions");
  if (toggleBtn && instructionsContent) {
    toggleBtn.addEventListener("click", () => {
      const isHidden = instructionsContent.style.display === "none";
      instructionsContent.style.display = isHidden ? "block" : "none";
      toggleBtn.classList.toggle("expanded");
    });
  }
  
  // Show modal
  modal.style.display = "block";
  
  // Handle close button
  const closeBtn = modal.querySelector(".modal-close");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  
  // Close on outside click
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
}

/**
 * Download QR Code as image
 */
function downloadQRCode(qrData) {
  // Create a canvas to combine QR code with ticket information
  const link = document.createElement("a");
  link.href = qrData.qrCode;
  link.download = `OCBC-Priority-Ticket-${qrData.consultationId}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize chatbot on page load
document.addEventListener("DOMContentLoaded", initChatbot);
