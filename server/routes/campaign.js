const express = require("express");
const Campaign = require("../models/Campaign");
const router = express.Router();
const Referral = require('../models/Referral');

// Middleware to ensure login
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ message: "Unauthorized" });
}

// Create campaign
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const newCampaign = new Campaign({
      business: req.user?._id,
      title: req.body?.title,
      taskDescription: req.body?.taskDescription,
      rewardDescription: req.body?.rewardDescription,
      messageToCustomers: req.body?.messageToCustomers,
    });

    await newCampaign.save();
    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Get campaigns for a business
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ business: req.user?._id });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});






router.get("/analytics", async (req, res) => {
  try {
    if (!req.user || !req.user?._json?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userEmail = req.user?._json.email;

    const campaigns = await Campaign.find({ createdBy: userEmail });

    const analytics = await Promise.all(
      campaigns.map(async (campaign) => {
        const completions = await Referral.find({ campaignId: campaign._id });

        return {
          campaignId: campaign._id,
          title: campaign.title,
          completions: completions.length,
          referrals: completions.map(r => ({
            name: r.name,
            email: r.email,
            rewardCode: r.rewardCode,
            redeemed: r.redeemed
          }))
        };
      })
    );

    res.json(analytics);
  } catch (err) {
    console.error("Analytics fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});






module.exports = router;
