import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

console.log("GEMINI KEY LOADED:", process.env.GEMINI_API_KEY ? "YES" : "NO");

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
