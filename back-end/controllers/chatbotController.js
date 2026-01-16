
import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are OCBC SmartHelp AI, a virtual assistant for OCBC Bank.

You are allowed to:
- Explain OCBC banking services and products
- Guide users on accounts, cards, and digital banking features
- Answer general banking questions
- Provide help with security, PIN reset, and support processes
- Share OCBC history and public information

You are NOT allowed to:
- Perform transactions
- Access or modify user data
- Provide financial, legal, or investment advice
- Answer questions unrelated to banking

If a question is unrelated, politely redirect the user to banking topics.
Always respond clearly, professionally, and calmly.
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function chatWithAI(req, res) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const reply =
      result.response?.text() ||
      "I'm here to help with OCBC banking services. Could you ask something related to accounts, cards, or support?";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);
    res.status(500).json({ error: "AI service error" });
  }
}
