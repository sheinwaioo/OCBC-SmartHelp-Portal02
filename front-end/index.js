/**
 * Main initialization and page-level functionality
 */

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize authentication state
  initAuth();

  // Update dashboard with logged-in user info if available
  if (currentUser) {
    document.getElementById("user-name").textContent = currentUser.fullName.split(" ")[0];
    document.getElementById("balance-display").textContent = formatCurrency(currentUser.accountBalance || 50000);
    document.getElementById("account-display").textContent = currentUser.accountNumber || "OCBC****";
  }

  // Initialize chatbot
  initChatbot();
});

// Navigation links functionality
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = e.target.getAttribute("href");

    // Remove active class from all links
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));

    // Add active class to clicked link
    e.target.classList.add("active");

    // Scroll to section (if exists)
    if (target && target !== "#") {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});
