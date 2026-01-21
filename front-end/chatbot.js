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
 * Show toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - Duration in ms (default 5000)
 */
function showToast(title, message, type = 'success', duration = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : '❌';
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

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
      "View Scheduled Callbacks",
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

  // Handle special commands
  if (message.toLowerCase().includes("view") && message.toLowerCase().includes("callback")) {
    userInput.value = "";
    if (!promptLogin("To view your scheduled callbacks")) return;
    viewScheduledCallbacks();
    return;
  }

  if (message.toLowerCase() === "view scheduled callbacks" || message.toLowerCase() === "my callbacks") {
    userInput.value = "";
    if (!promptLogin("To view your scheduled callbacks")) return;
    viewScheduledCallbacks();
    return;
  }

  if (message.startsWith("cancel_callback_")) {
    const callbackId = message.replace("cancel_callback_", "");
    userInput.value = "";
    cancelCallback(callbackId);
    return;
  }

  if (message === "Leave Queue & Schedule Callback" || message === "leave_and_callback") {
    userInput.value = "";
    handleLeaveQueueAndCallback();
    return;
  }

  if (message === "View tutorial again") {
    userInput.value = "";
    if (tutorialState.tutorialVersionId) {
      // Restart the same tutorial from the beginning
      startTutorial(tutorialState.tutorialVersionId, tutorialState.tutorialName || "Tutorial");
    } else {
      addBotMessage("Sorry, I can't find the previous tutorial. Please select a category to start.");
    }
    return;
  }

  if (message === "Yes, I'm all set!") {
    userInput.value = "";
    // Mark enquiry as resolved via self-service
    if (chatFlowState.enquiryId) {
      try {
        await apiCall("/enquiry/resolve", {
          method: "POST",
          body: JSON.stringify({
            enquiryId: chatFlowState.enquiryId,
            resolutionMethod: "self-resolved"
          })
        });
        // Show success toast
        if (typeof showNotification === "function") {
          showNotification("Enquiry marked resolved via self-resolved", "success");
        }
        addBotMessage("Great! I'm glad the tutorial helped you. Is there anything else I can help you with?");
        showQuickReplies(["New Enquiry", "View History", "Go Back"]);
      } catch (error) {
        console.error("Failed to update enquiry status:", error);
        addBotMessage("Thank you for the feedback! Is there anything else I can help you with?");
        showQuickReplies(["New Enquiry", "Go Back"]);
      }
    } else {
      addBotMessage("Great! Is there anything else I can help you with?");
      showQuickReplies(["New Enquiry", "Go Back"]);
    }
    return;
  }

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

    // Handle callback scheduling with new calendar UI
    if (response.suggestedAction === "select_callback_time") {
      // Use new calendar UI instead of old button list
      if (response.options && response.options.length > 0) {
        // Group slots by date
        const slotsByDate = {};
        response.options.forEach(opt => {
          if (!opt.date) return;
          
          if (!slotsByDate[opt.date]) {
            slotsByDate[opt.date] = {
              date: opt.date,
              slots: []
            };
          }
          slotsByDate[opt.date].slots.push({
            value: opt.value,
            time: opt.time,
            label: opt.text,
            datetime: opt.datetime
          });
        });
        
        // Display calendar instead of button list
        displayCallbackCalendar(slotsByDate);
      }
    } else {
      // Show quick action buttons or options for other actions
      if (response.options && response.options.length > 0) {
        showOptionsButtons(response.options, response.suggestedAction);
      }

      // Handle specific actions
      if (response.suggestedAction) {
        handleSuggestedAction(response.suggestedAction, response.options);
      }
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
      // Tutorial simulator will be launched by handleAssistanceSelection
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
    // Handle both string and object formats
    const displayText = typeof reply === 'string' ? reply : reply.text;
    const buttonValue = typeof reply === 'string' ? reply : reply.value;
    
    const button = createButton(displayText, buttonValue);
    
    // Handle "View QR Code" specially
    if (displayText === "View QR Code" || displayText === "Download QR Code") {
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
        userInput.value = buttonValue;
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
    } else if (action === "start_tutorial") {
      startTutorial(optionValue, "Selected Tutorial");
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
    // Use subcategory from chatFlowState (tutorials are linked to subcategories in DB)
    const subcategory = chatFlowState.subcategory;
    if (subcategory) {
      await handleTutorialStep(subcategory);
    } else {
      addBotMessage("Please select a specific service first to view tutorials.");
      showQuickReplies(["Go Back"]);
    }
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
 * Handle leaving queue and scheduling callback
 */
async function handleLeaveQueueAndCallback() {
  try {
    if (!isLoggedIn()) {
      promptLogin("To schedule a callback");
      return;
    }

    addBotMessage("Leaving queue...");
    
    // Leave the queue
    const leaveResponse = await apiCall("/queue/leave", {
      method: "POST",
      body: JSON.stringify({
        action: "leave"
      })
    });

    if (leaveResponse.success) {
      addBotMessage("You've left the queue. Let's schedule a callback instead.");
      // Show callback time slots
      await displayCallbackTimeSlots();
    } else {
      addBotMessage("Unable to leave queue. Please try again.");
      showQuickReplies(["Try Again", "Go Back"]);
    }
  } catch (error) {
    console.error("Leave queue and callback error:", error);
    addBotMessage("Something went wrong. Please try again.");
    showQuickReplies(["Try Again", "Go Back"]);
  }
}

/**
 * Display callback time slots - fetch from backend
 */
async function displayCallbackTimeSlots() {
  try {
    addBotMessage("When would you like us to call you? Please select a date:");
    
    // Fetch available slots from backend
    const response = await apiCall("/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "callback",
        flowState: chatFlowState
      })
    });

    if (response.options && response.options.length > 0) {
      // Group slots by date
      const slotsByDate = {};
      response.options.forEach(opt => {
        if (!opt.date) return;
        
        if (!slotsByDate[opt.date]) {
          slotsByDate[opt.date] = {
            date: opt.date,
            slots: []
          };
        }
        // Store complete slot info for time selection
        slotsByDate[opt.date].slots.push({
          value: opt.value,
          time: opt.time,
          label: opt.text,
          datetime: opt.datetime
        });
      });
      
      // Display calendar with date buttons
      displayCallbackCalendar(slotsByDate);
      
      // Update flow state
      if (response.flowState) {
        chatFlowState = response.flowState;
      }
    } else {
      // Fallback if API fails
      addBotMessage("Unable to load available dates. Please try again.");
      showQuickReplies(["Try Again", "Go Back"]);
    }
  } catch (error) {
    console.error("Failed to fetch callback slots:", error);
    addBotMessage("Unable to load available time slots. Please try again.");
    showQuickReplies(["Try Again", "Go Back"]);
  }
}

/**
 * Display calendar with selectable dates
 */
function displayCallbackCalendar(slotsByDate) {
  const chatMessages = document.getElementById("chat-messages");
  
  // Create calendar container
  const calendarContainer = document.createElement("div");
  calendarContainer.className = "callback-calendar";
  calendarContainer.innerHTML = `
    <div class="calendar-header">Select a Date</div>
    <div class="calendar-dates"></div>
  `;
  
  const datesContainer = calendarContainer.querySelector(".calendar-dates");
  
  // Create date buttons
  Object.keys(slotsByDate).forEach(dateKey => {
    const dateData = slotsByDate[dateKey];
    const dateButton = document.createElement("button");
    dateButton.className = "calendar-date-button";
    
    // Parse date for display - use the first slot's datetime
    let dateObj = dateData.slots[0]?.datetime;
    if (typeof dateObj === 'string') {
      dateObj = new Date(dateObj);
    }
    
    if (!dateObj) {
      // Fallback: parse from dateKey (e.g., "Jan 21, 2026")
      dateObj = new Date(dateKey);
    }
    
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    dateButton.innerHTML = `
      <div class="date-day">${dayName}</div>
      <div class="date-number">${monthDay}</div>
    `;
    
    dateButton.addEventListener("click", () => {
      // Remove previous selection
      document.querySelectorAll(".calendar-date-button").forEach(btn => {
        btn.classList.remove("selected");
      });
      dateButton.classList.add("selected");
      
      // Show time slots for selected date
      displayTimeSlots(dateData.slots, dateKey);
    });
    
    // Add keyboard navigation: arrow keys to move between dates
    dateButton.addEventListener("keydown", (e) => {
      const allButtons = Array.from(document.querySelectorAll(".calendar-date-button"));
      const currentIndex = allButtons.indexOf(dateButton);
      
      if (e.key === "ArrowRight" && currentIndex < allButtons.length - 1) {
        e.preventDefault();
        allButtons[currentIndex + 1].focus();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        allButtons[currentIndex - 1].focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Select the date
        document.querySelectorAll(".calendar-date-button").forEach(btn => {
          btn.classList.remove("selected");
        });
        dateButton.classList.add("selected");
        displayTimeSlots(dateData.slots, dateKey);
      }
    });
    
    datesContainer.appendChild(dateButton);
  });
  
  chatMessages.appendChild(calendarContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Display time slots for selected date
 */
function displayTimeSlots(slots, selectedDate) {
  // Remove any existing time slot container
  const existingTimeSlots = document.querySelector(".time-slots-container");
  if (existingTimeSlots) {
    existingTimeSlots.remove();
  }
  
  const chatMessages = document.getElementById("chat-messages");
  
  const timeSlotsContainer = document.createElement("div");
  timeSlotsContainer.className = "time-slots-container";
  timeSlotsContainer.innerHTML = `
    <div class="time-slots-header">Select a Time</div>
    <div class="time-slots-grid"></div>
  `;
  
  const timeSlotsGrid = timeSlotsContainer.querySelector(".time-slots-grid");
  
  // Create time slot buttons
  slots.forEach(slot => {
    const timeButton = document.createElement("button");
    timeButton.className = "time-slot-button";
    timeButton.textContent = slot.time;
    timeButton.dataset.value = slot.value;
    timeButton.dataset.date = selectedDate;
    timeButton.dataset.time = slot.time;
    
    timeButton.addEventListener("click", () => {
      // Show confirmation form
      showCallbackConfirmationForm(slot.value, selectedDate, slot.time);
    });
    
    // Add keyboard navigation: arrow keys and Enter/Space for time selection
    timeButton.addEventListener("keydown", (e) => {
      const allTimeButtons = Array.from(document.querySelectorAll(".time-slot-button"));
      const currentIndex = allTimeButtons.indexOf(timeButton);
      const gridCols = 4; // Assuming 4 columns in grid
      
      if (e.key === "ArrowRight" && currentIndex < allTimeButtons.length - 1) {
        e.preventDefault();
        allTimeButtons[currentIndex + 1].focus();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault();
        allTimeButtons[currentIndex - 1].focus();
      } else if (e.key === "ArrowDown" && currentIndex + gridCols < allTimeButtons.length) {
        e.preventDefault();
        allTimeButtons[currentIndex + gridCols].focus();
      } else if (e.key === "ArrowUp" && currentIndex - gridCols >= 0) {
        e.preventDefault();
        allTimeButtons[currentIndex - gridCols].focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        // Select the time
        showCallbackConfirmationForm(slot.value, selectedDate, slot.time);
      }
    });
    
    timeSlotsGrid.appendChild(timeButton);
  });
  
  chatMessages.appendChild(timeSlotsContainer);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Show callback confirmation form
 */
async function showCallbackConfirmationForm(timeValue, date, time) {
  // Remove existing form if any
  const existingForm = document.querySelector(".callback-confirmation-form");
  if (existingForm) {
    existingForm.remove();
  }
  
  const chatMessages = document.getElementById("chat-messages");
  
  // Get customer phone from profile
  let customerPhone = "";
  try {
    const profileResponse = await apiCall("/auth/profile", { method: "GET" });
    // Prefer the normalized shape { user: { mobileNumber } }, fallback to legacy mobile_number
    customerPhone = profileResponse?.user?.mobileNumber || profileResponse?.mobile_number || "";
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }
  
  const confirmationForm = document.createElement("div");
  confirmationForm.className = "callback-confirmation-form";
  confirmationForm.innerHTML = `
    <div class="form-header">Confirm Callback Details</div>
    <div class="form-content">
      <div class="form-field">
        <label>Date:</label>
        <input type="text" class="form-input" value="${date}" readonly />
      </div>
      <div class="form-field">
        <label>Time:</label>
        <input type="text" class="form-input" value="${time}" readonly />
      </div>
      <div class="form-field">
        <label>Phone Number: <span class="required">*</span></label>
        <input type="tel" id="callback-phone" class="form-input" value="${customerPhone}" 
               placeholder="+65 1234 5678" required />
        <small class="form-hint">Prefilled from your profile; you can edit if needed</small>
      </div>
      <div class="form-buttons">
        <button class="btn-confirm" id="confirm-callback-btn">Confirm Callback</button>
        <button class="btn-cancel" id="cancel-callback-form-btn">Cancel</button>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(confirmationForm);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  // Add event listeners
  document.getElementById("confirm-callback-btn").addEventListener("click", () => {
    const confirmBtn = document.getElementById("confirm-callback-btn");
    const phoneInput = document.getElementById("callback-phone");
    const phoneNumber = phoneInput.value.trim();
    
    // Validate phone is not empty
    if (!phoneNumber) {
      alert("Please enter a phone number");
      phoneInput.focus();
      return;
    }
    
    // Validate phone format (client-side)
    const phoneRegex = /^[+]?[0-9\s\-()]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert("Invalid phone number format.\n\nPlease use only:\n• Numbers (0-9)\n• Spaces\n• Plus sign (+)\n• Dashes (-)\n• Parentheses ( )");
      phoneInput.focus();
      phoneInput.select();
      return;
    }
    
    // Disable button and show loading state
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Scheduling...";
    confirmBtn.style.opacity = "0.6";
    confirmBtn.style.cursor = "not-allowed";
    
    // Submit callback
    handleCallbackConfirmation(timeValue, phoneNumber).catch(() => {
      // Re-enable button on error
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm Callback";
      confirmBtn.style.opacity = "1";
      confirmBtn.style.cursor = "pointer";
    });
  });
  
  document.getElementById("cancel-callback-form-btn").addEventListener("click", () => {
    confirmationForm.remove();
    addBotMessage("Callback cancelled. Would you like to try again?");
    showQuickReplies(["Schedule Callback", "Go Back"]);
  });
}

/**
 * Handle callback confirmation and submission
 */
async function handleCallbackConfirmation(timeValue, phoneNumber) {
  const form = document.querySelector(".callback-confirmation-form");
  
  try {
    addBotMessage("Scheduling your callback...");
    
    const response = await apiCall("/callbacks/schedule", {
      method: "POST",
      body: JSON.stringify({
        enquiryId: chatFlowState.enquiryId,
        preferredTime: timeValue,
        phoneNumber: phoneNumber
      })
    });

    if (response.success) {
      // Remove form on success
      if (form) form.remove();
      
      // Show toast notification
      showToast(
        'Callback Scheduled!',
        `We'll call you at ${response.phoneNumber} on ${response.scheduledTime}`,
        'success',
        6000
      );
      
      addBotMessage(
        `✅ Callback scheduled successfully!\n\n` +
        `📅 Time: ${response.scheduledTime}\n` +
        `📞 We'll call: ${response.phoneNumber}\n` +
        `🔖 Confirmation: ${response.confirmationCode}\n\n` +
        `Please ensure you're available at the scheduled time.`
      );
      showQuickReplies(["View My Callbacks", "New Enquiry", "Go Back"]);
    } else {
      // Show error toast
      showToast(
        'Scheduling Failed',
        response.error || "Failed to schedule callback",
        'error'
      );
      
      addBotMessage(`❌ ${response.error || "Failed to schedule callback"}`);
      showQuickReplies(["Try Again", "Go Back"]);
      throw new Error(response.error); // Trigger catch to re-enable button
    }
  } catch (error) {
    console.error("Callback confirmation error:", error);
    
    // Show error toast if not already shown
    if (!error.message) {
      showToast(
        'Scheduling Failed',
        'Something went wrong. Please try again.',
        'error'
      );
    }
    
    addBotMessage("Failed to schedule callback. Please try again.");
    showQuickReplies(["Try Again", "Go Back"]);
    throw error; // Propagate to button handler
  }
}

/**
 * Handle callback time selection (legacy - kept for backward compatibility)
 * New flow uses calendar + confirmation form instead
 */
async function handleCallbackTimeSelection(timeSlot) {
  // Redirect to new calendar flow
  displayCallbackTimeSlots();
}

/**
 * View customer's scheduled callbacks
 */
async function viewScheduledCallbacks() {
  try {
    addBotMessage("Fetching your scheduled callbacks...");
    
    const response = await apiCall("/callbacks", {
      method: "GET"
    });

    if (response.success && response.callbacks && response.callbacks.length > 0) {
      const callbackList = response.callbacks.map((cb, index) => {
        const time = new Date(cb.scheduled_time).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return `${index + 1}. 📞 ${time} - ${cb.phone_number}`;
      }).join('\\n');

      addBotMessage(`Your scheduled callbacks:\\n\\n${callbackList}`);
      
      // Create buttons for each callback to cancel
      const cancelButtons = response.callbacks.map(cb => ({
        text: `Cancel callback ${new Date(cb.scheduled_time).toLocaleDateString()}`,
        value: `cancel_callback_${cb.id}`
      }));
      
      showQuickReplies([...cancelButtons, "Go Back"]);
    } else {
      addBotMessage("You don't have any scheduled callbacks.");
      showQuickReplies(["Schedule Callback", "New Enquiry", "Go Back"]);
    }
  } catch (error) {
    console.error("View callbacks error:", error);
    addBotMessage("Unable to fetch your callbacks. Please try again.");
    showQuickReplies(["Try Again", "Go Back"]);
  }
}

/**
 * Cancel a specific callback
 */
async function cancelCallback(callbackId) {
  try {
    addBotMessage("Cancelling your callback...");
    
    const response = await apiCall(`/callbacks/${callbackId}`, {
      method: "DELETE"
    });

    if (response.success) {
      addBotMessage("✅ Your callback has been cancelled successfully.");
      showQuickReplies(["Schedule New Callback", "Join Queue", "Go Back"]);
    } else {
      addBotMessage(`❌ ${response.error || "Failed to cancel callback"}`);
      showQuickReplies(["Try Again", "Go Back"]);
    }
  } catch (error) {
    console.error("Cancel callback error:", error);
    addBotMessage("Failed to cancel callback. Please try again.");
    showQuickReplies(["Try Again", "Go Back"]);
  }
}

/**
 * Tutorial Simulator State
 */
const tutorialState = {
  currentStepIndex: 0,
  steps: [],
  tutorialVersionId: null,
  tutorialName: null,
  isScrolling: false,
  scrollAnimInterval: null,
  isFlipped: false
};

/**
 * Start Tutorial - Fetch and display tutorials for category
 */
async function handleTutorialStep(categoryName) {
  addBotMessage(`Loading tutorials for ${categoryName}...`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/tutorials/category/${encodeURIComponent(categoryName)}`);
    const data = await response.json();
    
    if (!data.success || !data.tutorials || data.tutorials.length === 0) {
      addBotMessage("Sorry, no tutorials are available for this topic at the moment. Would you like to speak with an agent instead?");
      showQuickReplies(["Speak with Agent", "Go Back"]);
      return;
    }
    
    // If only one tutorial, start it directly
    if (data.tutorials.length === 1) {
      startTutorial(data.tutorials[0].tutorial_version_id, data.tutorials[0].tutorial_name);
    } else {
      // Multiple tutorials - show selection
      addBotMessage("Please select a tutorial:");
      const options = data.tutorials.map(t => ({
        text: t.tutorial_name,
        value: t.tutorial_version_id,
        action: "start_tutorial"
      }));
      showOptions(options);
    }
  } catch (error) {
    console.error("Tutorial fetch error:", error);
    addBotMessage("I'm having trouble loading the tutorials. Would you like to try again or speak with an agent?");
    showQuickReplies(["Try Again", "Speak with Agent"]);
  }
}

/**
 * Load tutorial steps and start simulator
 */
async function startTutorial(tutorialVersionId, tutorialName) {
  addBotMessage(`Starting: ${tutorialName}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/tutorials/${tutorialVersionId}/steps`);
    const data = await response.json();
    
    if (!data.success || !data.steps || data.steps.length === 0) {
      addBotMessage("This tutorial has no steps available yet. Please try another option.");
      showQuickReplies(["Go Back", "Speak with Agent"]);
      return;
    }
    
    // Initialize tutorial state
    tutorialState.currentStepIndex = 0;
    tutorialState.steps = data.steps;
    tutorialState.tutorialVersionId = tutorialVersionId;
    tutorialState.tutorialName = tutorialName;
    tutorialState.isFlipped = false;
    
    // Render tutorial simulator in chat
    renderTutorialSimulator();
    
  } catch (error) {
    console.error("Tutorial steps fetch error:", error);
    addBotMessage("Unable to load tutorial steps. Please try again.");
    showQuickReplies(["Go Back"]);
  }
}

/**
 * Render the phone frame and tutorial UI as a modal overlay
 */
function renderTutorialSimulator() {
  // Create modal overlay
  const modal = document.createElement("div");
  modal.className = "tutorial-modal-overlay";
  modal.id = "tutorial-modal";
  
  modal.innerHTML = `
    <div class="tutorial-modal-content">
      <button class="tutorial-close-btn" onclick="closeTutorialSimulator()">&times;</button>
      <div class="phone-frame" id="phone-frame">
        <div class="phone-screen">
          <div class="phone-viewport" id="phone-viewport">
            <!-- Screen content will be dynamically rendered here -->
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Start with first step
  renderCurrentStep();
}

/**
 * Render current tutorial step
 */
function renderCurrentStep() {
  const step = tutorialState.steps[tutorialState.currentStepIndex];
  if (!step) return;
  
  const viewport = document.getElementById("phone-viewport");
  if (!viewport) return;
  
  // Clear previous content
  viewport.innerHTML = "";
  tutorialState.isFlipped = false;
  
  // Stop any existing scroll animation
  stopScrollAnimation();
  
  // Calculate dimensions
  const phoneWidth = viewport.offsetWidth;
  const screenHeight = phoneWidth * 2; // 9:18 aspect ratio
  
  // Calculate navbar height if nav asset exists
  let navbarHeight = 0;
  if (step.nav_public_url && step.nav_content_height && step.nav_content_width && step.nav_pixel_ratio) {
    const intrinsicRatio = step.nav_content_height / step.nav_content_width;
    navbarHeight = phoneWidth * intrinsicRatio;
  }
  
  const viewportHeight = screenHeight - navbarHeight;
  
  // Create screen viewport container
  const screenViewport = document.createElement("div");
  screenViewport.className = "screen-viewport";
  screenViewport.style.height = `${viewportHeight}px`;
  screenViewport.style.bottom = `${navbarHeight}px`;
  
  // Create animated layer for screen content
  const animLayer = document.createElement("div");
  animLayer.id = "screen-anim-layer";
  
  if (step.screen_public_url) {
    const screenImg = document.createElement("img");
    screenImg.src = step.screen_public_url;
    screenImg.alt = "Tutorial screen";
    animLayer.appendChild(screenImg);
  }
  
  screenViewport.appendChild(animLayer);
  viewport.appendChild(screenViewport);
  
  // Add navbar overlay if exists
  if (step.nav_public_url) {
    const navOverlay = document.createElement("div");
    navOverlay.className = "navbar-overlay";
    navOverlay.style.height = `${navbarHeight}px`;
    
    const navImg = document.createElement("img");
    navImg.src = step.nav_public_url;
    navImg.alt = "Navigation bar";
    navOverlay.appendChild(navImg);
    
    viewport.appendChild(navOverlay);
  }
  
  // Add tap target if coordinates exist
  if (step.target_x != null && step.target_y != null && step.target_w != null && step.target_h != null) {
    addTapTarget(viewport, step, phoneWidth, screenHeight, navbarHeight);
  }
  
  // Add coachmark instruction overlay
  addCoachmark(viewport, step, phoneWidth, screenHeight, navbarHeight);
  
  // Disable scroll animation for now to allow proper interaction
  // if (step.scroll_progress && step.scroll_progress > 0) {
  //   startScrollAnimation(animLayer, step.scroll_progress);
  // }
  
  // Add click handler to viewport
  viewport.onclick = (e) => handlePhoneTap(e, step, phoneWidth, screenHeight, navbarHeight);
}

/**
 * Add tap target hotspot
 */
function addTapTarget(viewport, step, phoneWidth, screenHeight, navbarHeight) {
  const target = document.createElement("div");
  target.className = "tap-target-cue";
  target.id = "tap-target";
  
  // Calculate position and size
  // Target coordinates are decimals (0-1), multiply directly by dimensions
  const targetX = step.target_x * phoneWidth;
  const targetY = step.target_y * screenHeight;
  const targetW = step.target_w * phoneWidth;
  const targetH = step.target_h * screenHeight;
  
  console.log("TAP TARGET POSITIONING:");
  console.log({ phoneWidth, screenHeight, navbarHeight });
  console.log("Raw coords:", { target_x: step.target_x, target_y: step.target_y, target_w: step.target_w, target_h: step.target_h });
  console.log("Calculated px:", { targetX, targetY, targetW, targetH });
  
  target.style.left = `${targetX}px`;
  target.style.top = `${targetY}px`;
  target.style.width = `${targetW}px`;
  target.style.height = `${targetH}px`;
  
  target.innerHTML = `
    <div class="tap-target-inner">
      <div class="tap-target-pulse"></div>
    </div>
  `;
  
  viewport.appendChild(target);
}

/**
 * Add coachmark instruction overlay
 */
function addCoachmark(viewport, step, phoneWidth, screenHeight, navbarHeight) {
  const overlay = document.createElement("div");
  overlay.className = "coachmark-overlay";
  overlay.id = "coachmark-overlay";
  
  const backdrop = document.createElement("div");
  backdrop.className = "coachmark-backdrop";
  overlay.appendChild(backdrop);
  
  const container = document.createElement("div");
  container.className = "coachmark-container";
  
  // Position coachmark to avoid covering the hotspot
  const hasTarget = step.target_x != null && step.target_y != null;
  if (hasTarget) {
    // Target is in upper portion (36.71-42.71%) - place coachmark at bottom
    container.style.bottom = "5%";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
  } else {
    // No target - center coachmark
    container.style.top = "50%";
    container.style.left = "50%";
    container.style.transform = "translate(-50%, -50%)";
  }
  
  // 3D flip container
  const flipContainer = document.createElement("div");
  flipContainer.className = "coachmark-3d";
  
  const inner = document.createElement("div");
  inner.className = "coachmark-inner";
  inner.id = "coachmark-inner";
  
  // Front face - instruction
  const front = document.createElement("div");
  front.className = "coachmark-face coachmark-front";
  front.innerHTML = `
    <div class="coachmark-step-label">Step ${tutorialState.currentStepIndex + 1} of ${tutorialState.steps.length}</div>
    <div class="coachmark-instruction">${step.instruction || "Tap the highlighted area"}</div>
    ${step.tip ? '<div class="coachmark-hint">TAP FOR TIP ↻</div>' : ""}
  `;
  
  // Back face - tip (if exists)
  const back = document.createElement("div");
  back.className = "coachmark-face coachmark-back";
  back.innerHTML = `
    <div class="coachmark-step-label">TIP</div>
    <div class="coachmark-instruction">${step.tip || ""}</div>
    <div class="coachmark-hint">TAP TO RETURN ↻</div>
  `;
  
  inner.appendChild(front);
  if (step.tip) {
    inner.appendChild(back);
  }
  
  flipContainer.appendChild(inner);
  container.appendChild(flipContainer);
  
  // Add flip handler if tip exists
  if (step.tip) {
    flipContainer.onclick = (e) => {
      e.stopPropagation();
      tutorialState.isFlipped = !tutorialState.isFlipped;
      inner.classList.toggle("flipped", tutorialState.isFlipped);
    };
  }
  
  overlay.appendChild(container);
  
  // If no tap target, show Next button
  if (!hasTarget) {
    const nextBtn = document.createElement("div");
    nextBtn.className = "tutorial-next-btn";
    nextBtn.innerHTML = '<button onclick="advanceTutorialStep()">Next</button>';
    container.appendChild(nextBtn);
  }
  
  viewport.appendChild(overlay);
}

/**
 * Handle phone screen tap
 */
function handlePhoneTap(event, step, phoneWidth, screenHeight, navbarHeight) {
  const viewport = event.currentTarget;
  const rect = viewport.getBoundingClientRect();
  
  // Calculate tap coordinates relative to phone screen
  const tapX = event.clientX - rect.left;
  const tapY = event.clientY - rect.top;
  
  // Convert to percentages based on FULL screen dimensions
  // Target coordinates in database are stored as decimals (0-1) of full screen
  const tapXPercent = (tapX / phoneWidth) * 100;
  const tapYPercent = (tapY / screenHeight) * 100;
  
  // Check if tap is within target bounds
  const hasTarget = step.target_x != null && step.target_y != null && step.target_w != null && step.target_h != null;
  
  console.log("=== TAP DEBUG ===");
  console.log("Viewport:", { phoneWidth, screenHeight });
  console.log("Tap pixel:", { tapX, tapY });
  console.log("Tap percent:", { tapXPercent, tapYPercent });
  
  if (hasTarget) {
    // Target coordinates are decimals (0-1), convert to percentages (0-100)
    const targetXStart = step.target_x * 100;
    const targetYStart = step.target_y * 100;
    const targetXEnd = (step.target_x + step.target_w) * 100;
    const targetYEnd = (step.target_y + step.target_h) * 100;
    
    console.log("Target (%):", { targetXStart, targetYStart, targetXEnd, targetYEnd });
    
    const TOLERANCE = 5;
    const isHit = 
      tapXPercent >= (targetXStart - TOLERANCE) && 
      tapXPercent <= (targetXEnd + TOLERANCE) &&
      tapYPercent >= (targetYStart - TOLERANCE) && 
      tapYPercent <= (targetYEnd + TOLERANCE);
    
    console.log("Hit:", isHit);
    console.log("=================");
    
    if (isHit) {
      advanceTutorialStep();
    } else {
      const phoneFrame = document.getElementById("phone-frame");
      if (phoneFrame) {
        phoneFrame.classList.add("shake");
        setTimeout(() => phoneFrame.classList.remove("shake"), 350);
      }
    }
  }
}

/**
 * Advance to next tutorial step
 */
function advanceTutorialStep() {
  tutorialState.currentStepIndex++;
  
  if (tutorialState.currentStepIndex >= tutorialState.steps.length) {
    // Tutorial complete
    completeTutorial();
  } else {
    // Render next step
    renderCurrentStep();
  }
}

/**
 * Complete tutorial and show completion message
 */
function completeTutorial() {
  stopScrollAnimation();
  
  const modal = document.getElementById("tutorial-modal");
  if (modal) {
    modal.remove();
  }
  
  addBotMessage("🎉 Great job! You've completed the tutorial. You should now be able to complete this task on your own.");
  addBotMessage("Did this tutorial resolve your problem?");
  showQuickReplies(["Yes, I'm all set!", "View tutorial again", "I need more help", "Speak with Agent"]);
}

/**
 * Close tutorial simulator modal
 */
function closeTutorialSimulator() {
  stopScrollAnimation();
  
  const modal = document.getElementById("tutorial-modal");
  if (modal) {
    modal.remove();
  }
  
  addBotMessage("Tutorial closed. How else can I help you?");
  showQuickReplies(["Try again", "Speak with Agent", "Go Back"]);
}

/**
 * Start scroll animation loop
 */
function startScrollAnimation(animLayer, scrollProgress) {
  if (tutorialState.isScrolling) return;
  
  tutorialState.isScrolling = true;
  
  const img = animLayer.querySelector("img");
  if (!img) return;
  
  const viewport = animLayer.parentElement;
  const viewportHeight = viewport.offsetHeight;
  
  // Wait for image to load
  const animate = () => {
    const imgHeight = img.offsetHeight;
    const maxScroll = Math.max(0, imgHeight - viewportHeight);
    const targetScroll = maxScroll * scrollProgress;
    
    let currentScroll = 0;
    let direction = 1; // 1 = down, -1 = up
    
    const animationLoop = () => {
      if (!tutorialState.isScrolling) return;
      
      if (direction === 1) {
        // Scrolling down
        const step = targetScroll / 80; // 1600ms / 20ms per frame
        currentScroll = Math.min(currentScroll + step, targetScroll);
        animLayer.style.transform = `translateY(-${currentScroll}px)`;
        
        if (currentScroll >= targetScroll) {
          // Reached bottom - pause then reverse
          setTimeout(() => {
            direction = -1;
            tutorialState.scrollAnimInterval = setInterval(animationLoop, 20);
          }, 2000);
          return;
        }
      } else {
        // Scrolling up
        const step = targetScroll / 60; // 1200ms / 20ms per frame
        currentScroll = Math.max(currentScroll - step, 0);
        animLayer.style.transform = `translateY(-${currentScroll}px)`;
        
        if (currentScroll <= 0) {
          // Reached top - pause then repeat
          setTimeout(() => {
            direction = 1;
            tutorialState.scrollAnimInterval = setInterval(animationLoop, 20);
          }, 600);
          return;
        }
      }
      
      tutorialState.scrollAnimInterval = setTimeout(animationLoop, 20);
    };
    
    animationLoop();
  };
  
  if (img.complete) {
    animate();
  } else {
    img.onload = animate;
  }
}

/**
 * Stop scroll animation
 */
function stopScrollAnimation() {
  tutorialState.isScrolling = false;
  if (tutorialState.scrollAnimInterval) {
    clearInterval(tutorialState.scrollAnimInterval);
    clearTimeout(tutorialState.scrollAnimInterval);
    tutorialState.scrollAnimInterval = null;
  }
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

// Make advanceTutorialStep globally accessible for onclick handlers
window.advanceTutorialStep = advanceTutorialStep;
window.closeTutorialSimulator = closeTutorialSimulator;

// Initialize chatbot on page load
document.addEventListener("DOMContentLoaded", initChatbot);
