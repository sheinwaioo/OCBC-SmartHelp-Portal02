/**
 * Utility Functions for OCBC SmartHelp
 */

// API Configuration
const API_BASE_URL = "http://localhost:3000/api";
let authToken = localStorage.getItem("authToken");

/**
 * Helper to fetch from API with auth
 */
async function apiCall(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired - clear it
      localStorage.removeItem("authToken");
      authToken = null;
      throw new Error("Session expired. Please login again.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API error");
    }

    return data;
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

/**
 * Modal helpers
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

/**
 * Close modals on outside click
 */
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
    document.body.style.overflow = "auto";
  }

  if (e.target.classList.contains("modal-close")) {
    e.target.closest(".modal").style.display = "none";
    document.body.style.overflow = "auto";
  }
});

/**
 * Format currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD"
  }).format(amount);
}

/**
 * Format date/time
 */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#3b82f6"};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    z-index: 9999;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  // Auto-remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

/**
 * Format time slot for display
 */
function formatTimeSlot(isoString) {
  const date = new Date(isoString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let dateStr = date.toLocaleDateString("en-SG", { month: "short", day: "numeric" });

  if (date.toDateString() === today.toDateString()) {
    dateStr = "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    dateStr = "Tomorrow";
  }

  const timeStr = date.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" });
  return `${dateStr}, ${timeStr}`;
}

/**
 * Button emoji mapping for common actions
 */
const BUTTON_ICONS = {
  "Yes, I'm all set!": "✓",
  "View tutorial again": "🔄",
  "I need more help": "❓",
  "Speak with Agent": "🎧",
  "New Enquiry": "➕",
  "Go Back": "←",
  "Join Queue Now": "📋",
  "Schedule Callback": "📅",
  "View QR Code": "📱",
  "Download QR Code": "⬇️",
  "Check Queue Status": "ℹ️",
  "View History": "📜",
  "Try Again": "🔁",
  "Schedule New Callback": "📅",
  "Leave Queue & Schedule Callback": "🔄",
  "View My Callbacks": "📞",
  "Check Balance": "💳",
  "View My Consultations": "📹",
  "Apply Now": "✏️",
  "Card Services": "💳",
  "Account & Banking": "🏦",
  "Check Enquiry History": "📋",
  "View Scheduled Callbacks": "📅",
  "View Available Consultations": "📹",
  "Report lost card": "⚠️",
  "Lock/unlock card": "🔒",
  "Manage card limit": "💰",
  "Link account to card": "🔗",
  "View Tutorial": "📚",
  "Physical Consultation": "🏪",
  "Online Agent Support": "💬"
};

/**
 * Get emoji for button text
 */
function getButtonIcon(buttonText) {
  return BUTTON_ICONS[buttonText] || "→";
}

/**
 * Create button element with card-style layout
 */
function createButton(text, value, additionalClass = "") {
  const button = document.createElement("button");
  button.className = `quick-reply ${additionalClass}`;
  button.value = value;
  
  // Get emoji for this button
  const emoji = getButtonIcon(text);
  
  // Create card-style button content: emoji on top, text below
  button.innerHTML = `
    <div class="button-icon">${emoji}</div>
    <div class="button-text">${text}</div>
  `;
  
  return button;
}

/**
 * Get initials from name
 */
function getInitials(fullName) {
  return fullName
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Generate avatar color based on name
 */
function getAvatarColor(fullName) {
  const colors = ["#ef2b2d", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b"];
  const hash = fullName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
