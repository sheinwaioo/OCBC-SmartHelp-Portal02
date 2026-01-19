/**
 * Authentication Module for OCBC SmartHelp
 */

let currentUser = null;

/**
 * Initialize auth UI on page load
 */
function initAuth() {
  const token = localStorage.getItem("authToken");
  const userDataStr = localStorage.getItem("userData");

  if (token && userDataStr) {
    try {
      currentUser = JSON.parse(userDataStr);
      updateAuthUI(true);
    } catch (error) {
      console.error("Failed to restore user session:", error);
      logout();
    }
  } else {
    updateAuthUI(false);
  }

  setupAuthListeners();
}

/**
 * Setup authentication event listeners
 */
function setupAuthListeners() {
  const authToggle = document.getElementById("auth-toggle");
  const authModal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // Toggle auth modal
  authToggle?.addEventListener("click", () => {
    openModal("auth-modal");
  });

  // Login form submission
  loginForm?.querySelector("form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLogin();
  });

  // Register form submission
  registerForm?.querySelector("form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleRegister();
  });

  // Logout button (if needed)
  const userProfile = document.getElementById("user-profile");
  userProfile?.addEventListener("click", (e) => {
    if (confirm("Logout?")) {
      logout();
    }
  });
}

/**
 * Handle login
 */
async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  try {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    // Store token and user data
    authToken = response.token;
    localStorage.setItem("authToken", authToken);

    currentUser = response.user;
    localStorage.setItem("userData", JSON.stringify(currentUser));
    localStorage.setItem("customerId", response.user.customerId);

    showNotification(`Welcome back, ${currentUser.name}!`, "success");

    // Reset form and close modal
    document.getElementById("login-form").querySelector("form").reset();
    closeModal("auth-modal");

    updateAuthUI(true);
    updateDashboard();
  } catch (error) {
    showNotification(error.message || "Login failed", "error");
  }
}

/**
 * Handle register (Team Schema)
 */
async function handleRegister() {
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const mobileNumber = document.getElementById("register-phone")?.value || null;
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm").value;

  if (!name || !email || !password || !confirmPassword) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Passwords do not match", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    return;
  }

  try {
    const response = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, mobileNumber })
    });

    // Store token and user data
    authToken = response.token;
    localStorage.setItem("authToken", authToken);

    currentUser = response.user;
    localStorage.setItem("userData", JSON.stringify(currentUser));
    localStorage.setItem("customerId", response.user.customerId);

    showNotification(`Welcome to OCBC SmartHelp, ${name}!`, "success");

    // Reset form and close modal
    document.getElementById("register-form").querySelector("form").reset();
    closeModal("auth-modal");

    updateAuthUI(true);
    updateDashboard();
  } catch (error) {
    showNotification(error.message || "Registration failed", "error");
  }
}

/**
 * Logout user
 */
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("customerId");
  authToken = null;
  currentUser = null;

  updateAuthUI(false);
  showNotification("You have been logged out", "info");

  // Reset chat
  const chatMessages = document.getElementById("chat-messages");
  if (chatMessages) {
    chatMessages.innerHTML = "";
  }
}

function updateAuthUI(isLoggedIn) {
  const authToggle = document.getElementById("auth-toggle");
  const userProfile = document.getElementById("user-profile");
  const welcomeCard = document.getElementById("welcome-card");
  const summaryCards = document.getElementById("summary-cards");

  if (isLoggedIn && currentUser) {
    // Hide login button
    authToggle.style.display = "none";
    userProfile.style.display = "flex";

    // Update user info (Team schema uses 'name' instead of 'fullName')
    const initials = getInitials(currentUser.name || currentUser.fullName);
    document.getElementById("user-tier").textContent = "PREMIER";
    document.getElementById("user-avatar").textContent = initials;
    document.getElementById("user-name").textContent = (currentUser.name || currentUser.fullName || "User").split(" ")[0];

    // Show dashboard content
    if (welcomeCard) welcomeCard.style.display = "flex";
    if (summaryCards) summaryCards.style.display = "grid";
  } else {
    // Show login button
    authToggle.style.display = "block";
    userProfile.style.display = "none";

    // Update placeholder info
    document.getElementById("user-name").textContent = "User";

    // Show minimal dashboard
    if (welcomeCard) welcomeCard.style.display = "flex";
    if (summaryCards) summaryCards.style.display = "grid";
  }
}

/**
 * Update dashboard with user data
 */
function updateDashboard() {
  if (currentUser) {
    document.getElementById("balance-display").textContent = formatCurrency(currentUser.accountBalance || 50000);
    document.getElementById("account-display").textContent = currentUser.accountNumber || "OCBC****";
  }
}

/**
 * Switch to register form
 */
function switchToRegister() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("register-form").style.display = "block";
}

/**
 * Switch to login form
 */
function switchToLogin() {
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!authToken && !!currentUser;
}

/**
 * Prompt login if not authenticated
 */
function promptLogin(actionName = "This action") {
  if (!isLoggedIn()) {
    showNotification(`${actionName} requires login`, "info");
    openModal("auth-modal");
    return false;
  }
  return true;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", initAuth);
