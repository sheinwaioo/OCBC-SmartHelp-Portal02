import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { chatWithAI, handleQueueAction, requestConsultationQR, handleCallbackRequest, getCustomerCallbacks, cancelCustomerCallback } from "./controllers/chatbotController.js";
import { register, login, getProfile } from "./controllers/authController.js";
import { getTutorials, getTutorialsByCategoryName, getTutorialSteps } from "./controllers/tutorialController.js";
import { resolveEnquiry } from "./controllers/enquiryController.js";
import { authMiddleware, optionalAuthMiddleware } from "./middlewares/authMiddleware.js";

dotenv.config();

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= AUTHENTICATION ROUTES =================
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.get("/api/auth/profile", authMiddleware, getProfile);

// ================= CHATBOT ROUTES =================
// Main chatbot endpoint - supports both logged in and anonymous
app.post("/api/chat", optionalAuthMiddleware, chatWithAI);

// Queue operations (requires login)
app.post("/api/queue/join", authMiddleware, handleQueueAction);
app.post("/api/queue/leave", authMiddleware, handleQueueAction);
app.get("/api/queue/position", authMiddleware, handleQueueAction);

// Callback scheduling (requires login)
app.post("/api/callbacks/schedule", authMiddleware, handleCallbackRequest);
app.get("/api/callbacks", authMiddleware, getCustomerCallbacks);
app.delete("/api/callbacks/:callbackId", authMiddleware, cancelCustomerCallback);

// Consultation QR code (requires login)
app.post("/api/consultations/qr", authMiddleware, requestConsultationQR);

// ================= TUTORIAL ROUTES =================
// Get all published tutorials
app.get("/api/tutorials", getTutorials);

// Get tutorials by category
app.get("/api/tutorials/category/:categoryName", getTutorialsByCategoryName);

// Get tutorial steps by version ID
app.get("/api/tutorials/:tutorialVersionId/steps", getTutorialSteps);

// ================= ENQUIRY ROUTES =================
// Mark enquiry as resolved
app.post("/api/enquiry/resolve", resolveEnquiry);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// ==========================================

export default app;
