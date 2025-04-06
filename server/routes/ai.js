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







router.post("/promoter", async (req, res) => {
  const { prompt, campaignId } = req.body;
  if (!prompt || !campaignId) {
    return res.status(400).json({ message: "Prompt and campaignId are required" });
  }

  try {
    const Campaign = require("../models/Campaign");
    const Business = require("../models/Business");

    const campaign = await Campaign.findById(campaignId).populate("business");
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const businessName = campaign.business?.name || "our brand";

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
You are an AI assistant helping someone write a friendly referral email.

The campaign is created by a business named **${businessName}**.

Campaign Details:
- Title: ${campaign.title}
- Task: ${campaign.taskDescription}
- Reward: ${campaign.rewardDescription}
- Business message: ${campaign.messageToCustomers}

The promoter describes their promotion idea as:
"${prompt}"

✅ Return a short JSON like:
{
  "subject": "Get 20% off your next coffee ☕",
  "body": "Hey! My favorite cafe ${businessName} is offering 20% off if you join through my link. Thought of you. Check it out!"
}

Only return valid JSON. No backticks, no markdown. Only the JSON object.
                `
              }
            ]
          }
        ]
      }
    );

    const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    const firstCurly = rawText.indexOf("{");
    const lastCurly = rawText.lastIndexOf("}") + 1;
    const jsonString = rawText.slice(firstCurly, lastCurly);
    const json = JSON.parse(jsonString);

    return res.json(json);
  } catch (err) {
    console.error("❌ Promoter AI Error:", err.response?.data || err.message);
    return res.status(500).json({ message: "AI failed to generate promoter content" });
  }
});










module.exports = router;
