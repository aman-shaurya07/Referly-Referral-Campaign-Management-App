const express = require("express");
const Campaign = require("../models/Campaign");
const router = express.Router();
const Referral = require('../models/Referral');
const BusinessCustomer = require("../models/BusinessCustomer");
const Business = require("../models/Business");
const sendEmail = require("../utils/sendEmail");



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




// ✅ If not present, you should add this:
router.get('/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    res.json(campaign);
  } catch (err) {
    console.error('❌ Error fetching campaign:', err);
    res.status(500).json({ message: 'Server error' });
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








// Notify all promoters after campaign creation

router.post('/:campaignId/notify-promoters', async (req, res) => {
  try {
    const businessEmail = req.user?.email;
    if (!businessEmail) {
      console.log("❌ No logged-in user");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      console.log("❌ Campaign not found:", campaignId);
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const promoters = await BusinessCustomer.find({
      businessEmail,
      isLoyal: true
    });

    if (promoters.length === 0) {
      console.log("⚠️ No promoters found for:", businessEmail);
      return res.status(200).json({ message: 'No promoters found' });
    }

    const business = await Business.findOne({ email: businessEmail });
    const businessName = business?.name || "Your Business";

    const failed = [];

    for (const promoter of promoters) {
      try {
        const link = `${process.env.FRONTEND_URL}/promote/${campaignId}/${promoter.customerEmail}`;
        const html = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
          <h2 style="color: #4f46e5;">👋 Hello from ${businessName}!</h2>
          
          <p>You're one of our valued customers, and we'd love your help spreading the word about our latest campaign.</p>
          
          <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #10b981;">🎯 Campaign: ${campaign.title}</h3>
            <p><strong>📋 Task:</strong> ${campaign.taskDescription}</p>
            <p><strong>🏆 Reward:</strong> ${campaign.rewardDescription}</p>
            <p>${campaign.messageToCustomers}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              🚀 Start Promoting
            </a>
          </div>

          <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 13px; color: #888;">
            This campaign was created by ${businessName} using Referly.
            If you have any questions, reach out to <a href="mailto:${businessEmail}" style="color: #4f46e5;">${businessEmail}</a>.
          </p>
        </div>
      `;

        await sendEmail(
          promoter.customerEmail,
          `📣 New Campaign: ${campaign.title}`,
          html
        );
      } catch (err) {
        console.error(`❌ Failed to send email to ${promoter.customerEmail}`);
        failed.push(promoter.customerEmail);
      }
    }

    return res.json({ message: 'Emails sent', failed });
  } catch (err) {
    console.error("🔥 Error notifying promoters:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});






// GET /api/campaigns/:campaignId/promoter/:email
router.get("/campaigns/:campaignId/promoter/:email", async (req, res) => {
  const { campaignId, email } = req.params;

  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const promoter = await BusinessCustomer.findOne({ customerEmail: email });
    if (!promoter) return res.status(404).json({ message: "Promoter not found" });

    const business = await Business.findOne({ email: campaign.businessEmail });

    res.json({
      campaign,
      promoterName: promoter.name,
      businessName: business?.name || campaign.businessEmail,
    });
  } catch (err) {
    console.error("Promoter fetch error", err);
    res.status(500).json({ message: "Error fetching campaign details" });
  }
});





router.post('/referrals/send', async (req, res) => {
  const { recipientEmail, customMessage, campaignId, promoterEmail } = req.body;

  const campaign = await Campaign.findById(campaignId);
  const referralLink = `${process.env.FRONTEND_URL}/referral/${campaignId}/${promoterEmail}/${recipientEmail}`;

  const emailHtml = `
    <h2>🎁 ${campaign.title}</h2>
    <p>${customMessage}</p>
    <p><strong>Task:</strong> ${campaign.taskDescription}</p>
    <p><strong>Reward:</strong> ${campaign.rewardDescription}</p>
    <a href="${referralLink}">👉 Claim Your Reward</a>
  `;

  await sendEmail(recipientEmail, `You’ve been invited to ${campaign.title}!`, emailHtml);
  res.json({ message: "Referral email sent!" });
});







module.exports = router;
