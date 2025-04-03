const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ message: "Prompt is required" });

  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-001:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are a helpful marketing AI assistant. Based on the given campaign goal, return ONLY a valid JSON object with the following keys: "title", "taskDescription", "rewardDescription", "messageToCustomers". Do not include any explanation, markdown, or backticks. Only pure JSON.

Campaign Goal: ${prompt}
                `
              }
            ]
          }
        ]
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    // Try to extract valid JSON if response wraps it
    const firstCurly = rawText.indexOf("{");
    const lastCurly = rawText.lastIndexOf("}") + 1;
    const jsonString = rawText.slice(firstCurly, lastCurly);

    const json = JSON.parse(jsonString);
    return res.json(json);
  } catch (err) {
    console.error("❌ AI Error:", err.response?.data || err.message);
    return res.status(500).json({ message: "AI failed to generate content" });
  }
});

module.exports = router;
