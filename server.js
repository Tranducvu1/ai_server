import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error("⚠️ GOOGLE_API_KEY is undefined. Check your .env file.");
  process.exit(1);
}
console.log("GOOGLE_API_KEY =", GOOGLE_API_KEY);

app.post("/api/completions/v2", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Missing request body" });
    }

    const { model, messages } = req.body;
    if (!model || !messages) {
      return res.status(400).json({ error: "Missing model or messages in body" });
    }

    // Lấy message cuối của user
    const userMessage = messages.find(m => m.role === "user")?.content || "";
    if (!userMessage) {
      return res.status(400).json({ error: "No user message found" });
    }

    // Gọi Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI server running on port ${PORT}`));
