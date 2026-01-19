# OCBC SmartHelp Portal - Complete Project Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Frontend Structure](#frontend-structure)
4. [Backend Structure](#backend-structure)
5. [Database Schema](#database-schema)
6. [Request Flow Examples](#request-flow-examples)
7. [Key Concepts](#key-concepts)
8. [Debugging Guide](#debugging-guide)
9. [Running the Project](#running-the-project)

---

## 🎯 Project Overview

**OCBC SmartHelp Portal** is a banking customer service platform with an AI-powered chatbot that helps customers with:
- Card services (lost cards, limits, linking)
- Account & banking queries
- Loan & finance information
- Physical branch consultations (QR code generation)
- Online queue management
- Callback scheduling

**Tech Stack:**
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Node.js + Express.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.5-flash-lite
- **Authentication**: JWT (JSON Web Tokens)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Frontend (Vanilla JavaScript)               │   │
│  │  - index.html (UI)                                  │   │
│  │  - auth.js (Login/Register)                         │   │
│  │  - chatbot.js (Chat Interface)                      │   │
│  │  - utils.js (API calls)                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓ HTTP Requests                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Backend Server (Node.js)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Controllers (Handle HTTP requests)                  │   │
│  │  - authController.js                                │   │
│  │  - chatbotController.js                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Services (Business Logic)                           │   │
│  │  - enquiryService.js                                │   │
│  │  - consultationService.js                           │   │
│  │  - queueService.js                                  │   │
│  │  - intentEngine.js (Gemini AI)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                Supabase (PostgreSQL Database)               │
│  Tables:                                                    │
│  - customer, account, card                                  │
│  - enquiry, enquiry_category                                │
│  - consultations, callbacks, queue_entries                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Structure

### **File Organization**
```
front-end/
├── index.html          # Main HTML structure
├── index.css           # All styling
├── index.js            # Page initialization
├── auth.js             # Login/Register/Logout
├── chatbot.js          # Chat interface & flow
└── utils.js            # Shared utilities & API calls
```

### **index.html - Main HTML Structure**

**Purpose**: Defines the entire UI layout

**Key Sections:**
```html
<!-- Navigation Bar -->
<nav class="navbar">
  <a href="#" onclick="openModal('login-modal')">Login</a>
</nav>

<!-- Hero Section (Landing page) -->
<section class="hero">
  <h1>Welcome to OCBC SmartHelp</h1>
</section>

<!-- Chatbot Widget (Bottom right) -->
<div class="chatbot-widget">
  <div id="chat-messages"></div>
  <input id="user-input" />
</div>

<!-- Modals (Popups) -->
<div id="login-modal" class="modal">...</div>
<div id="register-modal" class="modal">...</div>
```

**What are Modals?**
- Popup dialog boxes that appear on top of the page
- Used for login and registration forms
- Hidden by default (`display: none`)
- Shown with `openModal()` function

---

### **index.js - Page Initialization**

**Purpose**: Runs when page loads, sets up everything

**Main Functions:**

```javascript
// 1. Wait for page to fully load
document.addEventListener("DOMContentLoaded", () => {
  
  // 2. Check if user is logged in
  initAuth();  // From auth.js
  
  // 3. Update dashboard with user info
  if (currentUser) {
    document.getElementById("user-name").textContent = currentUser.name;
    document.getElementById("balance-display").textContent = formatCurrency(50000);
    document.getElementById("account-display").textContent = currentUser.accountNumber;
  }
  
  // 4. Start chatbot
  initChatbot();  // From chatbot.js
});

// 5. Handle navigation link clicks (smooth scrolling)
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    // Scroll to section, add active class
  });
});
```

**Execution Order:**
1. HTML loads → Browser parses all elements
2. `DOMContentLoaded` fires → `index.js` runs
3. Checks for saved login token
4. Updates UI with user data
5. Activates chatbot

---

### **auth.js - Authentication**

**Purpose**: Handles user login, registration, and logout

**Key Variables:**
```javascript
let authToken = localStorage.getItem("authToken");  // JWT token
let currentUser = null;  // User data object
```

**Main Functions:**

#### **1. initAuth() - Check Login Status**
```javascript
function initAuth() {
  if (authToken) {
    // User is logged in
    // Show logout button, hide login button
    // Fetch and store user profile
  } else {
    // User is logged out
    // Show login button
  }
}
```

#### **2. handleRegister() - Create New Account**
```javascript
async function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  
  // Call backend API
  const response = await apiCall("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password })
  });
  
  // Save token and user data
  authToken = response.token;
  localStorage.setItem("authToken", authToken);
  localStorage.setItem("customerId", response.user.customerId);
  
  // Update UI
  updateAuthUI(response.user);
  closeModal("register-modal");
}
```

#### **3. handleLogin() - Existing User Login**
```javascript
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  
  // Call backend API
  const response = await apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  
  // Save token
  authToken = response.token;
  localStorage.setItem("authToken", authToken);
  localStorage.setItem("customerId", response.user.customerId);
  
  // Update UI
  updateAuthUI(response.user);
  closeModal("login-modal");
}
```

#### **4. handleLogout() - Clear Session**
```javascript
function handleLogout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("customerId");
  authToken = null;
  currentUser = null;
  location.reload();  // Refresh page
}
```

**localStorage Explained:**
- Browser storage that persists even after closing tab
- Stores key-value pairs: `localStorage.setItem("key", "value")`
- Retrieved with: `localStorage.getItem("key")`
- Used to remember login state between sessions

---

### **chatbot.js - Chat Interface**

**Purpose**: Manages chatbot UI and conversation flow

**Key Variables:**
```javascript
let flowState = {
  category: null,        // e.g., "Card Services"
  subcategory: null,     // e.g., "Report Lost Card"
  enquiryId: null,       // Database ID of enquiry
  isLoggedIn: false
};
```

**Main Functions:**

#### **1. initChatbot() - Setup Chat**
```javascript
function initChatbot() {
  // Attach event listeners
  document.getElementById("chat-send").addEventListener("click", handleUserMessage);
  document.getElementById("user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserMessage();
  });
  
  // Show welcome message
  addBotMessage("Hello! Welcome to OCBC SmartHelp...");
}
```

#### **2. handleUserMessage() - Send Message**
```javascript
async function handleUserMessage() {
  const message = document.getElementById("user-input").value;
  
  // Add user message to chat
  addUserMessage(message);
  
  // Send to backend
  const response = await apiCall("/chat", {
    method: "POST",
    body: JSON.stringify({
      message: message,
      flowState: flowState
    })
  });
  
  // Update flow state
  flowState = response.flowState;
  
  // Display bot response
  addBotMessage(response.message);
  
  // Show options (buttons)
  if (response.options && response.options.length > 0) {
    displayOptions(response.options, response.suggestedAction);
  }
}
```

#### **3. displayOptions() - Show Button Choices**
```javascript
function displayOptions(options, action) {
  const optionsContainer = document.createElement("div");
  optionsContainer.className = "chat-options";
  
  options.forEach(option => {
    const button = document.createElement("button");
    button.textContent = option.text;
    button.onclick = () => handleOptionClick(option.value, action);
    optionsContainer.appendChild(button);
  });
  
  document.getElementById("chat-messages").appendChild(optionsContainer);
}
```

#### **4. handleBranchSelection() - QR Code Generation**
```javascript
async function handleBranchSelection(branch) {
  addBotMessage(`Generating your consultation QR code for ${branch}...`);
  
  const response = await apiCall("/consultations/qr", {
    method: "POST",
    body: JSON.stringify({
      branch: branch,
      enquiryId: flowState.enquiryId
    })
  });
  
  // Display QR code image
  if (response.qrCode) {
    const qrImage = document.createElement("img");
    qrImage.src = response.qrCode;
    qrImage.className = "qr-code-image";
    document.getElementById("chat-messages").appendChild(qrImage);
  }
}
```

**Conversation Flow State:**
```javascript
// Initial state
{ category: null, subcategory: null, enquiryId: null }

// User selects "Card Services"
{ category: "Card Services", subcategory: null, enquiryId: null }

// User selects "Report Lost Card"
{ category: "Card Services", subcategory: "Report Lost Card", enquiryId: null }

// Backend creates enquiry
{ category: "Card Services", subcategory: "Report Lost Card", enquiryId: "abc-123" }
```

---

### **utils.js - Shared Utilities**

**Purpose**: Reusable functions for API calls, formatting, modals

**Key Functions:**

#### **1. apiCall() - HTTP Requests to Backend**
```javascript
async function apiCall(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  
  // Add auth token if exists
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(`http://localhost:3000/api${endpoint}`, {
      ...options,
      headers
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
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
```

#### **2. Modal Helpers**
```javascript
// Show modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";  // Disable scrolling
}

// Hide modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = "none";
  document.body.style.overflow = "auto";  // Enable scrolling
}
```

#### **3. Formatting Functions**
```javascript
// Format money: 50000 → "$50,000.00"
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Format date: "2026-01-19T10:30:00" → "Jan 19, 2026"
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
```

---

## ⚙️ Backend Structure

### **File Organization**
```
back-end/
├── server.js                    # Entry point - starts server
├── app.js                       # Route definitions
├── supabaseClient.js            # Database connection
├── package.json                 # Dependencies
├── .env                         # Environment variables
├── controllers/
│   ├── authController.js        # Login/Register handlers
│   └── chatbotController.js     # Chat & QR handlers
├── services/
│   ├── enquiryService.js        # Enquiry CRUD
│   ├── consultationService.js   # QR generation
│   ├── queueService.js          # Queue management
│   └── intentEngine.js          # Gemini AI integration
├── middlewares/
│   └── authMiddleware.js        # JWT verification
└── utils/
    └── jwtUtils.js              # Token generation/validation
```

---

### **server.js - Entry Point**

**Purpose**: Starts the Express server

```javascript
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();  // Load .env file

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
```

---

### **app.js - Route Definitions**

**Purpose**: Maps URLs to controller functions

```javascript
import express from "express";
import cors from "cors";
import { register, login, getProfile } from "./controllers/authController.js";
import { chatWithAI, requestConsultationQR, handleQueueAction } from "./controllers/chatbotController.js";
import { authMiddleware, optionalAuthMiddleware } from "./middlewares/authMiddleware.js";

const app = express();

// Middleware
app.use(cors());                      // Allow frontend requests
app.use(express.json());              // Parse JSON bodies

// ============ PUBLIC ROUTES (No login required) ============
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// ============ PROTECTED ROUTES (Login required) ============
app.get("/api/auth/profile", authMiddleware, getProfile);
app.post("/api/consultations/qr", authMiddleware, requestConsultationQR);
app.post("/api/queue/join", authMiddleware, handleQueueAction);

// ============ OPTIONAL AUTH (Works with or without login) ============
app.post("/api/chat", optionalAuthMiddleware, chatWithAI);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

export default app;
```

**Route Types:**
- **Public**: Anyone can access (login, register)
- **Protected**: Requires `authMiddleware` (QR generation, queue)
- **Optional Auth**: Works with or without login (chatbot)

---

### **Controllers**

#### **authController.js - Authentication Handlers**

**Purpose**: Handle login, registration, profile

```javascript
import supabase from "../supabaseClient.js";
import { generateToken } from "../utils/jwtUtils.js";

// ========== REGISTER ==========
export async function register(req, res) {
  try {
    const { email, password, name, mobileNumber } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if customer exists
    const { data: existing } = await supabase
      .from("customer")
      .select("customer_id")
      .eq("email", email)
      .single();
    
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }
    
    // Create customer
    const { data: newCustomer, error } = await supabase
      .from("customer")
      .insert([{
        email,
        password,  // TODO: Hash with bcrypt in production
        name,
        mobile_number: mobileNumber || null,
        joined_at: new Date()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Generate JWT token
    const token = generateToken(newCustomer.customer_id, newCustomer.email);
    
    // Return token and user data
    res.status(201).json({
      token,
      user: {
        customerId: newCustomer.customer_id,
        name: newCustomer.name,
        email: newCustomer.email,
        mobileNumber: newCustomer.mobile_number
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
}

// ========== LOGIN ==========
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }
    
    // Get customer from database
    const { data: customer, error } = await supabase
      .from("customer")
      .select("*")
      .eq("email", email)
      .single();
    
    if (error || !customer) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Verify password (plaintext for now - use bcrypt in production)
    if (customer.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Get customer's account
    const { data: account } = await supabase
      .from("account")
      .select("account_number, balance")
      .eq("customer_id", customer.customer_id)
      .single();
    
    // Generate token
    const token = generateToken(customer.customer_id, customer.email);
    
    res.json({
      token,
      user: {
        customerId: customer.customer_id,
        email: customer.email,
        name: customer.name,
        mobileNumber: customer.mobile_number,
        accountNumber: account?.account_number || null,
        accountBalance: account?.balance || 0
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

// ========== GET PROFILE ==========
export async function getProfile(req, res) {
  try {
    const customerId = req.user.userId;  // From authMiddleware
    
    const { data: customer, error } = await supabase
      .from("customer")
      .select("*")
      .eq("customer_id", customerId)
      .single();
    
    if (error) throw error;
    
    res.json({
      customerId: customer.customer_id,
      name: customer.name,
      email: customer.email,
      mobileNumber: customer.mobile_number
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}
```

---

#### **chatbotController.js - Chatbot Orchestration**

**Purpose**: Main chatbot logic, routes requests to services

**Key Function: chatWithAI()**
```javascript
export async function chatWithAI(req, res) {
  try {
    const { message, flowState = {} } = req.body;
    const customerId = req.user?.userId;
    const isLoggedIn = !!customerId;
    
    // 1. Classify intent using Gemini AI
    const intent = await classifyIntent(message);
    
    // 2. Update flow state
    let newState = { ...flowState, isLoggedIn };
    
    if (!newState.category) {
      newState.category = intent.category;
    }
    
    // Don't auto-detect subcategory - let user choose
    if (!newState.subcategory && newState.category !== "unknown") {
      if (intent.subcategory && intent.confidence > 0.7) {
        newState.detectedSubcategory = intent.subcategory;
      }
    }
    
    // 3. Create enquiry if both category and subcategory selected
    if (newState.category && newState.subcategory && !newState.enquiryId && isLoggedIn) {
      try {
        const enquiry = await createEnquiry(customerId, newState.category, newState.subcategory);
        newState.enquiryId = enquiry?.enquiry_id;
      } catch (error) {
        console.error("Failed to create enquiry:", error);
      }
    }
    
    // 4. Generate response based on flow state
    let response = {
      message: "",
      options: [],
      suggestedAction: null,
      requiresLogin: false,
      flowState: newState
    };
    
    // Check what to show next
    if (!newState.category || newState.category === "unknown") {
      // Show main categories
      response.message = "Welcome to OCBC SmartHelp! How can I help you today?";
      response.suggestedAction = "select_category";
      response.options = Object.values(CATEGORIES).map(cat => ({
        text: cat,
        value: cat
      }));
    } else if (newState.category && !newState.subcategory) {
      // Show subcategories
      const categoryKey = newState.category.replace(" & ", "_").replace(/ /g, "_").toUpperCase();
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
    
    res.json(response);
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Chat failed" });
  }
}
```

**QR Code Generation:**
```javascript
export async function requestConsultationQR(req, res) {
  try {
    const customerId = req.user?.userId;
    const { branch, enquiryId, category, subcategory } = req.body;
    
    // Create enquiry if not exists
    if (!enquiryId) {
      const enquiry = await createEnquiry(customerId, category, subcategory);
      enquiryId = enquiry?.enquiry_id;
    }
    
    // Generate QR code
    const result = await generateConsultationQR(customerId, enquiryId, branch);
    res.json(result);
  } catch (error) {
    console.error("Generate QR error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
}
```

---

### **Services - Business Logic**

#### **enquiryService.js - Enquiry Management**

**Purpose**: Create and manage customer enquiries

```javascript
import supabase from "../supabaseClient.js";

// ========== CREATE ENQUIRY ==========
export async function createEnquiry(customerId, categoryName, subcategoryName) {
  try {
    // Fetch all categories (case-insensitive matching)
    const { data: allCategories, error: fetchError } = await supabase
      .from("enquiry_category")
      .select("enquiry_category_id, name");
    
    if (fetchError) throw fetchError;
    
    // Find matching category (case-insensitive)
    const categoryData = allCategories?.find(cat => 
      cat.name.toLowerCase() === subcategoryName.toLowerCase()
    );
    
    if (!categoryData) {
      throw new Error(`Category not found: ${subcategoryName}`);
    }
    
    // Insert enquiry
    const { data, error } = await supabase
      .from("enquiry")
      .insert([{
        customer_id: customerId,
        category_id: categoryData.enquiry_category_id,
        description: `${categoryName} - ${subcategoryName}`,
        status: "open",
        created_at: new Date()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Create enquiry error:", error);
    throw error;
  }
}

// ========== GET ENQUIRY HISTORY ==========
export async function getEnquiryHistory(customerId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("enquiry")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Get enquiry history error:", error);
    return [];
  }
}
```

**Why Case-Insensitive Matching?**
- Database might have "Manage card limit"
- Frontend might send "Manage Card Limit"
- `.toLowerCase()` ensures they match

---

#### **consultationService.js - QR Code Generation**

**Purpose**: Generate QR codes for branch consultations

```javascript
import supabase from "../supabaseClient.js";
import QRCode from "qrcode";

export async function generateConsultationQR(customerId, enquiryId, preferredBranch = null) {
  try {
    // Generate unique consultation ID
    const timestamp = Date.now().toString().slice(-4);
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    const consultationId = `ENQ-${timestamp}-${randomPart}`;
    
    // QR code URL (scannable by phones)
    const qrUrl = `https://ocbc-smarthelp.sg/branch/check-in?token=${consultationId}`;
    
    // Generate QR code image (base64 PNG)
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: "H",
      width: 300,
      margin: 1
    });
    
    // Store in database
    const { data, error } = await supabase
      .from("consultations")
      .insert([{
        customer_id: customerId,
        enquiry_id: enquiryId,
        consultation_id: consultationId,
        qr_code_image: qrCodeDataUrl,
        preferred_branch: preferredBranch || "Main Branch",
        status: "scheduled",
        created_at: new Date()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      success: true,
      consultationId: consultationId,
      qrCode: qrCodeDataUrl,  // Base64 PNG image
      branch: preferredBranch || "Main Branch",
      instructions: [
        "Scan or show this QR code at your OCBC branch",
        "Expected wait time: 5-10 minutes from check-in",
        "Code valid for 7 working days"
      ]
    };
  } catch (error) {
    console.error("Generate QR error:", error);
    throw error;
  }
}
```

**QR Code Format:**
- Generated as base64-encoded PNG image
- Can be displayed in `<img src="data:image/png;base64,...">` tag
- Encodes a URL that branches can scan
- Unique per consultation

---

#### **intentEngine.js - Gemini AI Integration**

**Purpose**: Classify user intent using Gemini AI

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export async function classifyIntent(userMessage) {
  try {
    const prompt = `
You are an intent classifier for an OCBC banking chatbot.
Classify this user message into one of these categories:
- Card Services
- Account & Banking
- Loan & Finances

User message: "${userMessage}"

Respond in JSON format:
{
  "category": "Card Services",
  "subcategory": "Report Lost Card",
  "confidence": 0.95,
  "isGreeting": false
}
`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback
    return {
      category: "unknown",
      confidence: 0,
      isGreeting: false
    };
  } catch (error) {
    console.error("Intent classification error:", error);
    return { category: "unknown", confidence: 0 };
  }
}
```

**How It Works:**
1. Sends user message to Gemini AI
2. Gemini analyzes message and returns category/subcategory
3. Confidence score indicates how sure AI is
4. Fallback to "unknown" if API fails

---

### **Middlewares**

#### **authMiddleware.js - JWT Verification**

**Purpose**: Verify JWT tokens and protect routes

```javascript
import { verifyToken } from "../utils/jwtUtils.js";

// ========== REQUIRED AUTH ==========
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: "Unauthorized: No token provided",
      requiresLogin: true
    });
  }
  
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)  // Remove "Bearer " prefix
    : authHeader;
  
  try {
    const user = verifyToken(token);  // Verify and decode JWT
    req.user = user;  // Attach user info to request
    next();  // Continue to controller
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized: Invalid token",
      requiresLogin: true
    });
  }
}

// ========== OPTIONAL AUTH ==========
export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    
    try {
      const user = verifyToken(token);
      req.user = user;  // Attach if valid
    } catch (error) {
      // Ignore error, continue without user
    }
  }
  
  next();  // Continue regardless
}
```

**How It Works:**
```
Request → authMiddleware → Controller
   ↓
1. Check for Authorization header
2. Extract JWT token
3. Verify token signature
4. Decode token to get userId
5. Attach to req.user
6. Call next() to continue
```

---

### **Utilities**

#### **jwtUtils.js - Token Management**

**Purpose**: Generate and verify JWT tokens

```javascript
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ocbc-secret-key-2024";

// ========== GENERATE TOKEN ==========
export function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },           // Payload
    JWT_SECRET,                  // Secret key
    { expiresIn: "7d" }          // Expires in 7 days
  );
}

// ========== VERIFY TOKEN ==========
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);  // Returns { userId, email }
  } catch (error) {
    throw new Error("Invalid token");
  }
}
```

**JWT Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZW1haWwuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDE2MDAwMDB9.signature

Header.Payload.Signature
```

---

## 🗄️ Database Schema

### **Team's Tables (Already Exist)**

#### **customer - User Accounts**
```sql
CREATE TABLE customer (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile_number TEXT,
  address TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  pin_number TEXT,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  TotpSecret TEXT,
  IsMfaVerified BOOLEAN DEFAULT FALSE
);
```

#### **enquiry_category - Hierarchical Categories**
```sql
CREATE TABLE enquiry_category (
  enquiry_category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES enquiry_category(enquiry_category_id)
);

-- Example data:
-- Card Services (parent_id = NULL)
--   ├── Manage card limit (parent_id = Card Services ID)
--   ├── Report lost card (parent_id = Card Services ID)
--   └── Link account to card (parent_id = Card Services ID)
```

**Hierarchy Explained:**
- Main categories have `parent_id = NULL`
- Subcategories have `parent_id` pointing to main category
- Query subcategories: `WHERE parent_id = <main_category_id>`

#### **enquiry - Customer Enquiries**
```sql
CREATE TABLE enquiry (
  enquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id),
  category_id UUID REFERENCES enquiry_category(enquiry_category_id),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'open',
  resolution_method TEXT
);
```

#### **account - Bank Accounts**
```sql
CREATE TABLE account (
  account_id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customer(customer_id),
  account_number TEXT,
  balance DECIMAL(15,2),
  type TEXT
);
```

### **Your Custom Tables**

#### **consultations - QR Code Check-ins**
```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id),
  enquiry_id UUID REFERENCES enquiry(enquiry_id),
  consultation_id TEXT UNIQUE NOT NULL,
  qr_data TEXT,
  qr_code_image TEXT,  -- Base64 PNG
  preferred_branch TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **callbacks - Scheduled Callbacks**
```sql
CREATE TABLE callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id),
  enquiry_id UUID REFERENCES enquiry(enquiry_id),
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

#### **queue_entries - Online Queue**
```sql
CREATE TABLE queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id),
  enquiry_id UUID REFERENCES enquiry(enquiry_id),
  position INTEGER,
  status TEXT DEFAULT 'waiting',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMPTZ
);
```

---

## 🔄 Request Flow Examples

### **Example 1: User Login**

```
┌─────────────┐
│  FRONTEND   │
└─────────────┘
      │
      │ 1. User enters email/password, clicks Login
      │
      ├─> handleLogin() in auth.js
      │
      │ 2. Call backend API
      │    POST /api/auth/login
      │    Body: { email, password }
      ↓
┌─────────────┐
│   BACKEND   │
└─────────────┘
      │
      │ 3. app.js routes to authController.login()
      │
      ├─> authController.js
      │
      │ 4. Query customer table
      │    SELECT * FROM customer WHERE email = ?
      ↓
┌─────────────┐
│  DATABASE   │
└─────────────┘
      │
      │ 5. Return customer data
      ↑
┌─────────────┐
│   BACKEND   │
└─────────────┘
      │
      │ 6. Verify password
      │ 7. Generate JWT token
      │ 8. Return response
      │    { token, user: { customerId, name, email } }
      ↑
┌─────────────┐
│  FRONTEND   │
└─────────────┘
      │
      │ 9. Save token to localStorage
      │10. Update UI (show logout button)
      │11. Refresh dashboard with user info
```

---

### **Example 2: QR Code Generation**

```
┌─────────────┐
│  FRONTEND   │
└─────────────┘
      │
      │ 1. User selects "Physical Consultation" → Branch
      │
      ├─> handleBranchSelection() in chatbot.js
      │
      │ 2. Call backend API
      │    POST /api/consultations/qr
      │    Headers: { Authorization: "Bearer <token>" }
      │    Body: { branch, enquiryId }
      ↓
┌─────────────┐
│   BACKEND   │
└─────────────┘
      │
      │ 3. app.js → authMiddleware
      │
      ├─> authMiddleware.js
      │
      │ 4. Verify JWT token
      │ 5. Attach req.user = { userId }
      │ 6. Call next()
      │
      ├─> chatbotController.requestConsultationQR()
      │
      │ 7. If no enquiryId:
      │    - Call createEnquiry() → Insert into enquiry table
      │
      │ 8. Call generateConsultationQR()
      │
      ├─> consultationService.js
      │
      │ 9. Generate unique consultation ID
      │10. Create QR code image (QRCode.toDataURL)
      │11. Insert into consultations table
      ↓
┌─────────────┐
│  DATABASE   │
└─────────────┘
      │
      │12. Store consultation record
      ↑
┌─────────────┐
│   BACKEND   │
└─────────────┘
      │
      │13. Return response
      │    { qrCode: "data:image/png;base64,...", consultationId, branch }
      ↑
┌─────────────┐
│  FRONTEND   │
└─────────────┘
      │
      │14. Display QR code image in chat
      │15. Show instructions
```

---

## 🔑 Key Concepts

### **1. JWT Authentication**

**What is JWT?**
- JSON Web Token - encrypted string containing user data
- Format: `header.payload.signature`
- Signed with secret key to prevent tampering

**Flow:**
```
Login → Backend generates JWT → Frontend stores in localStorage
   ↓
Every API request includes: Authorization: Bearer <JWT>
   ↓
Backend verifies JWT → Extracts userId → Processes request
```

**Why JWT?**
- Stateless: Server doesn't need to store sessions
- Secure: Signed with secret key
- Portable: Can be used across multiple servers

---

### **2. Supabase Queries**

**SELECT:**
```javascript
const { data, error } = await supabase
  .from("customer")
  .select("*")
  .eq("email", "test@email.com")
  .single();
```

**INSERT:**
```javascript
const { data, error } = await supabase
  .from("enquiry")
  .insert([{
    customer_id: userId,
    category_id: catId,
    status: "open"
  }])
  .select()
  .single();
```

**UPDATE:**
```javascript
const { data, error } = await supabase
  .from("enquiry")
  .update({ status: "resolved" })
  .eq("enquiry_id", enquiryId);
```

---

### **3. Async/Await**

**What is it?**
- Modern way to handle asynchronous operations (database queries, API calls)
- Waits for operation to complete before continuing

**Example:**
```javascript
// Without async/await (callback hell)
fetch('/api/login')
  .then(response => response.json())
  .then(data => {
    saveToken(data.token);
    fetch('/api/profile')
      .then(response => response.json())
      .then(profile => {
        updateUI(profile);
      });
  });

// With async/await (clean)
async function login() {
  const response = await fetch('/api/login');
  const data = await response.json();
  saveToken(data.token);
  
  const profileResponse = await fetch('/api/profile');
  const profile = await profileResponse.json();
  updateUI(profile);
}
```

---

### **4. Environment Variables (.env)**

**Purpose**: Store sensitive configuration outside code

**.env file:**
```
SUPABASE_URL=https://kgcfpicbzpqdlttvkaiq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyAB1CD2EF3GH4IJ5KL6MN7OP8QR9ST0UV1
JWT_SECRET=ocbc-secret-key-2024
PORT=3000
```

**Usage:**
```javascript
import dotenv from "dotenv";
dotenv.config();  // Load .env file

const apiKey = process.env.GEMINI_API_KEY;
```

**Why .env?**
- Keep secrets out of Git repository
- Different values for dev/production
- Easy to change without modifying code

---

## 🐛 Debugging Guide

### **Problem: Login Returns 401**

**Steps:**
1. Check browser console for error message
2. Check backend logs for database errors
3. Verify `customer` table exists in Supabase
4. Test database query manually in Supabase SQL editor:
   ```sql
   SELECT * FROM customer WHERE email = 'test@email.com';
   ```
5. Check password comparison logic in [authController.js](back-end/controllers/authController.js)

---

### **Problem: QR Code Generation Fails (500 Error)**

**Steps:**
1. Check if `consultations` table exists
2. Check if `enquiry_category` table has data
3. Check backend logs for specific error
4. Test enquiry creation manually:
   ```sql
   SELECT * FROM enquiry_category WHERE LOWER(name) = 'manage card limit';
   ```
5. Verify case-insensitive matching in [enquiryService.js](back-end/services/enquiryService.js)

---

### **Problem: Chatbot Doesn't Show Subcategories**

**Steps:**
1. Check [chatbotController.js](back-end/controllers/chatbotController.js) flow logic
2. Verify `flowState.category` is set correctly
3. Check response structure includes `options` array
4. Verify SUBCATEGORIES constant in [intentEngine.js](back-end/services/intentEngine.js)
5. Check frontend [chatbot.js](front-end/chatbot.js) `displayOptions()` function

---

### **Problem: "Session expired" Error**

**Steps:**
1. Check if token is saved in localStorage: `localStorage.getItem("authToken")`
2. Verify token is sent in Authorization header
3. Check [authMiddleware.js](back-end/middlewares/authMiddleware.js) verification
4. Test token validity with JWT debugger: https://jwt.io
5. Check JWT_SECRET matches between backend and token generation

---

## 🚀 Running the Project

### **1. Prerequisites**
```bash
# Install Node.js (v18+)
# Install Python (for frontend server)
```

### **2. Setup Backend**
```bash
cd back-end
npm install
```

Create `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=ocbc-secret-key-2024
PORT=3000
```

Start backend:
```bash
npm start
# Should see: "Backend running at http://localhost:3000"
```

### **3. Setup Frontend**
```bash
cd front-end
python -m http.server 8080
# Should see: "Serving HTTP on port 8080"
```

### **4. Access Application**
Open browser: http://localhost:8080

### **5. Test Login**
Use credentials from your Supabase `customer` table:
- Email: `s10269496@connect.np.edu.sg`
- Password: `123456789`

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Express.js Guide**: https://expressjs.com/
- **JWT Introduction**: https://jwt.io/introduction
- **Gemini AI API**: https://ai.google.dev/docs

---

## ✅ Summary Checklist

**Frontend Files:**
- [ ] `index.html` - UI structure with modals
- [ ] `index.js` - Page initialization
- [ ] `auth.js` - Login/Register/Logout
- [ ] `chatbot.js` - Chat interface
- [ ] `utils.js` - API calls & helpers

**Backend Files:**
- [ ] `server.js` - Starts server
- [ ] `app.js` - Route definitions
- [ ] `authController.js` - Login/Register handlers
- [ ] `chatbotController.js` - Chat orchestration
- [ ] `enquiryService.js` - Enquiry CRUD
- [ ] `consultationService.js` - QR generation
- [ ] `authMiddleware.js` - JWT verification

**Database Tables:**
- [ ] `customer` - User accounts
- [ ] `enquiry_category` - Hierarchical categories
- [ ] `enquiry` - Customer enquiries
- [ ] `consultations` - QR code check-ins
- [ ] `callbacks` - Scheduled callbacks
- [ ] `queue_entries` - Online queue

**Key Concepts:**
- [ ] JWT authentication flow
- [ ] Supabase query syntax
- [ ] Async/await pattern
- [ ] Environment variables
- [ ] Hierarchical categories with parent_id

---

**Need help with a specific part?** Ask me to explain any section in more detail!
