import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { chatWithAI } from "./controllers/chatbotController.js";

dotenv.config();

const app = express();

// Global middleware (HealthyLah style)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================

// Health check
app.post("/api/chat", chatWithAI);
// ==========================================

export default app;
