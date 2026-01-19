import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import supabase from "../supabaseClient.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple in-memory cache for intent classification (expires after 1 hour)
const intentCache = new Map();
const categoryCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Intent Classification Engine
 * Uses Gemini to understand user intent and maps to structured categories
 * Fetches categories from Team's enquiry_category table
 * 
 * UX Philosophy:
 * - Minimize user input by auto-detecting intent
 * - Skip unnecessary branching when intent is clear
 * - Always prefer structured flows over freeform AI responses
 * - Use caching to reduce API quota usage
 */

// Fallback categories (if database unavailable)
const CATEGORIES = {
  CARD_SERVICES: "Card Services",
  ACCOUNT_BANKING: "Account & Banking",
  LOAN_FINANCES: "Loan & Finances"
};

const SUBCATEGORIES = {
  CARD_SERVICES: {
    LOST_CARD: "Report Lost Card",
    CARD_LIMIT: "Manage Card Limit",
    LINK_ACCOUNT: "Link Account to Card",
    LOCK_UNLOCK: "Lock / Unlock Card"
  },
  ACCOUNT_BANKING: {
    RESET_PIN: "Reset Login PIN",
    CHECK_BALANCE: "Check Balance",
    UPDATE_DETAILS: "Update Personal Details"
  },
  LOAN_FINANCES: {
    LOAN_INQUIRY: "Loan Inquiry",
    INVESTMENT_ADVISORY: "Investment Advisory",
    SAVINGS_PLANS: "Savings Plans"
  }
};

/**
 * Get categories from Team's enquiry_category table
 */
export async function getCategories() {
  try {
    // Check cache first
    if (categoryCache.has("categories") && Date.now() - categoryCache.get("categories").timestamp < CACHE_DURATION) {
      return categoryCache.get("categories").data;
    }

    // Fetch from database
    const { data, error } = await supabase
      .from("enquiry_category")
      .select("*")
      .is("parent_id", null); // Get only main categories

    if (error || !data) {
      console.warn("Failed to fetch categories, using fallback");
      return Object.values(CATEGORIES);
    }

    const categoryNames = data.map(cat => cat.name);
    categoryCache.set("categories", {
      data: categoryNames,
      timestamp: Date.now()
    });

    return categoryNames;
  } catch (error) {
    console.error("Get categories error:", error);
    return Object.values(CATEGORIES);
  }
}

/**
 * Get subcategories for a category
 */
export async function getSubcategories(categoryName) {
  try {
    // Find category by name
    const { data: categoryData, error: catError } = await supabase
      .from("enquiry_category")
      .select("enquiry_category_id")
      .eq("name", categoryName)
      .single();

    if (catError || !categoryData) {
      console.warn("Category not found:", categoryName);
      return SUBCATEGORIES[categoryName] || {};
    }

    // Get subcategories (where parent_id matches this category)
    const { data: subcats, error } = await supabase
      .from("enquiry_category")
      .select("name")
      .eq("parent_id", categoryData.enquiry_category_id);

    if (error || !subcats) {
      console.warn("Subcategories not found for:", categoryName);
      return SUBCATEGORIES[categoryName] || {};
    }

    return subcats.reduce((acc, subcat) => {
      acc[subcat.name.toUpperCase().replace(/ /g, "_")] = subcat.name;
      return acc;
    }, {});
  } catch (error) {
    console.error("Get subcategories error:", error);
    return SUBCATEGORIES[categoryName] || {};
  }
}

/**
 * Classify user intent using Gemini
 * Returns structured intent object
 * Uses caching to reduce API quota usage
 * Falls back to demo mode on quota exceeded
 */
export async function classifyIntent(userMessage) {
  try {
    // Check cache first
    const cacheKey = userMessage.toLowerCase().trim();
    const cached = intentCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("📦 Using cached intent for:", cacheKey);
      return cached.data;
    }

    // Demo mode: return intent based on keyword matching (fallback for quota exceeded)
    const demoIntent = classifyIntentDemo(userMessage);
    
    // If demo mode detected something clear, use it without calling API
    if (demoIntent.confidence > 0.7) {
      console.log("🎭 Using demo mode classification");
      intentCache.set(cacheKey, {
        data: demoIntent,
        timestamp: Date.now()
      });
      return demoIntent;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite"
    });

    const prompt = `
You are OCBC's intent classifier. Analyze this user message and classify it into EXACTLY one category and subcategory.

User Message: "${userMessage}"

CATEGORIES:
- Card Services: Report Lost Card, Manage Card Limit, Link Account to Card, Lock / Unlock Card
- Account & Banking: Reset Login PIN, Check Balance, Update Personal Details
- Loan & Finances: Loan Inquiry, Investment Advisory, Savings Plans

Respond in JSON format ONLY:
{
  "category": "Category Name",
  "subcategory": "Subcategory Name",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation"
}

If message is unclear or off-topic, set category to "unknown".
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { category: "unknown", subcategory: null, confidence: 0 };
    }

    const intent = JSON.parse(jsonMatch[0]);
    
    // Cache the result
    intentCache.set(cacheKey, {
      data: intent,
      timestamp: Date.now()
    });

    return intent;
  } catch (error) {
    console.error("Intent classification error:", error);
    
    // Fallback: use demo mode when API fails
    const demoIntent = classifyIntentDemo(userMessage);
    console.log("🎭 Falling back to demo mode due to API error");
    return demoIntent;
  }
}

/**
 * Demo mode: Classify intent using keyword matching
 * Used as fallback when API quota is exceeded
 */
function classifyIntentDemo(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // Greeting keywords - return unknown with high confidence so bot can greet user
  if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || 
      msg.includes("greetings") || msg.includes("how are you") || 
      msg.includes("good morning") || msg.includes("good afternoon") || 
      msg.includes("good evening") || msg === "hello") {
    return { category: "unknown", subcategory: null, confidence: 0.95, isGreeting: true };
  }
  
  // Card Services keywords
  if (msg.includes("lost") || msg.includes("stolen") || msg.includes("card")) {
    return { category: "Card Services", subcategory: "Report Lost Card", confidence: 0.9 };
  }
  if (msg.includes("limit") || msg.includes("increase") || msg.includes("decrease")) {
    return { category: "Card Services", subcategory: "Manage Card Limit", confidence: 0.85 };
  }
  if (msg.includes("lock") || msg.includes("unlock") || msg.includes("freeze")) {
    return { category: "Card Services", subcategory: "Lock / Unlock Card", confidence: 0.9 };
  }
  if (msg.includes("link") || msg.includes("attach") || msg.includes("account")) {
    return { category: "Card Services", subcategory: "Link Account to Card", confidence: 0.8 };
  }
  
  // Account & Banking keywords
  if (msg.includes("balance") || msg.includes("check balance") || msg.includes("how much")) {
    return { category: "Account & Banking", subcategory: "Check Balance", confidence: 0.95 };
  }
  if (msg.includes("pin") || msg.includes("reset") || msg.includes("password")) {
    return { category: "Account & Banking", subcategory: "Reset Login PIN", confidence: 0.9 };
  }
  if (msg.includes("update") || msg.includes("change") || msg.includes("details")) {
    return { category: "Account & Banking", subcategory: "Update Personal Details", confidence: 0.85 };
  }
  
  // Loan & Finances keywords
  if (msg.includes("loan") || msg.includes("borrow") || msg.includes("financing")) {
    return { category: "Loan & Finances", subcategory: "Loan Inquiry", confidence: 0.9 };
  }
  if (msg.includes("invest") || msg.includes("investment") || msg.includes("stock")) {
    return { category: "Loan & Finances", subcategory: "Investment Advisory", confidence: 0.85 };
  }
  if (msg.includes("save") || msg.includes("savings") || msg.includes("plan")) {
    return { category: "Loan & Finances", subcategory: "Savings Plans", confidence: 0.8 };
  }
  
  // Unknown
  return { category: "unknown", subcategory: null, confidence: 0 };
}

/**
 * Get next flow step based on current state
 * Returns suggested questions or actions
 */
export function getFlowStep(category, subcategory, currentStep = 0) {
  if (!category || category === "unknown") {
    return {
      step: "select_category",
      message: "I can help you with:",
      options: Object.values(CATEGORIES),
      suggestedAction: "category_selection"
    };
  }

  if (!subcategory) {
    const categoryKey = category.replace(" ", "_").replace("&", "").toUpperCase();
    const subCats = SUBCATEGORIES[categoryKey];
    
    if (!subCats) {
      return {
        step: "select_category",
        message: "I can help you with:",
        options: Object.values(CATEGORIES),
        suggestedAction: "category_selection"
      };
    }
    
    return {
      step: "select_subcategory",
      message: `You're interested in ${category}. How can I help?`,
      options: Object.values(subCats),
      suggestedAction: "subcategory_selection"
    };
  }

  // Flow is identified, move to assistance options
  return {
    step: "select_assistance",
    message: `I'll help you with: ${subcategory}\n\nHow would you like to proceed?`,
    options: [
      "View Tutorial",
      "Physical Consultation",
      "Online Agent Support"
    ],
    suggestedAction: "assistance_selection"
  };
}

/**
 * Map user selection to structured flow
 */
export function mapSelection(selection, currentCategory = null) {
  // Check if selecting a category
  for (const [key, value] of Object.entries(CATEGORIES)) {
    if (selection.toLowerCase().includes(value.toLowerCase())) {
      return { category: value, subcategory: null };
    }
  }

  // Check if selecting a subcategory
  if (currentCategory) {
    const categoryKey = currentCategory.replace(" ", "_").replace("&", "").toUpperCase();
    for (const [key, value] of Object.entries(SUBCATEGORIES[categoryKey] || {})) {
      if (selection.toLowerCase().includes(value.toLowerCase())) {
        return { category: currentCategory, subcategory: value };
      }
    }
  }

  return null;
}

/**
 * Get assistance option details
 */
export function getAssistanceDetails(option) {
  const details = {
    "View Tutorial": {
      type: "tutorial",
      message: "Here are some helpful resources:",
      requiresLogin: false,
      content: generateTutorialContent()
    },
    "Physical Consultation": {
      type: "consultation",
      message: "Schedule a physical consultation at your nearest OCBC branch",
      requiresLogin: true,
      action: "schedule_consultation"
    },
    "Online Agent Support": {
      type: "agent",
      message: "Connect with an OCBC customer service representative",
      requiresLogin: true,
      action: "join_queue"
    }
  };

  return details[option] || null;
}

/**
 * Generate placeholder tutorial content
 * In production, fetch from CMS
 */
function generateTutorialContent() {
  return [
    {
      title: "Step 1: Access Settings",
      description: "Open your OCBC mobile app and navigate to Settings"
    },
    {
      title: "Step 2: Select Your Option",
      description: "Find the relevant section based on your inquiry"
    },
    {
      title: "Step 3: Complete Your Request",
      description: "Follow the on-screen prompts to complete your request"
    },
    {
      title: "Need More Help?",
      description: "Contact our support team for additional assistance"
    }
  ];
}

export { CATEGORIES, SUBCATEGORIES };
