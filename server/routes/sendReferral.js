// routes/sendReferral.js
const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");
const Campaign = require("../models/Campaign");
const BusinessCustomer = require("../models/BusinessCustomer");
const Business = require("../models/Business");

router.post("/send-email-friend", async (req, res) => {
  try {
    const { campaignId, promoterEmail, friendEmail, subject, body } = req.body;

    if (!campaignId || !promoterEmail || !friendEmail || !subject || !body) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get campaign details
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    // Get business name
    const business = await Business.findById(campaign.business);
    const businessName = business?.name || "our business";

    // Get promoter name
    const promoter = await BusinessCustomer.findOne({
      businessEmail: business.email,
      customerEmail: promoterEmail,
    });
    const promoterName = promoter?.name || promoterEmail;

    // Generate referral link
    const referralLink = `${process.env.FRONTEND_URL}/referral/${campaignId}/${promoterEmail}`;

    // 💌 Beautified Email HTML
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 24px;">
        <h2 style="color: #4f46e5;">👋 Hey! Your friend ${promoterName} has a surprise for you!</h2>

        <p style="font-size: 15px; color: #333;">
          They’re sharing a new campaign from <strong>${businessName}</strong> that comes with rewards. Check out the details below:
        </p>

        <div style="margin: 20px 0; background-color: #f9f9f9; border-left: 4px solid #4f46e5; padding: 16px;">
          <h3 style="margin: 0;">📣 ${campaign.title}</h3>
          <p style="margin: 4px 0;"><strong>📝 Task:</strong> ${campaign.taskDescription}</p>
          <p style="margin: 4px 0;"><strong>🎁 Reward:</strong> ${campaign.rewardDescription}</p>
        </div>

        <p style="color: #555; font-size: 14px;">
          ${body}
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${referralLink}" style="background: #10b981; color: white; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold;">
            🚀 Claim Your Reward
          </a>
        </div>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />

        <p style="font-size: 12px; color: #aaa; text-align: center;">
          This campaign is powered by Referly on behalf of ${businessName}. Sent by ${promoterEmail}.
        </p>
      </div>
    `;

    // ✉️ Send email
    await sendEmail(friendEmail, subject, html);
    console.log(`✅ Referral email sent to ${friendEmail} by ${promoterEmail}`);
    res.status(200).json({ message: "Referral email sent!" });
  } catch (err) {
    console.error("❌ Error sending referral:", err);
    res.status(500).json({ message: "Failed to send referral" });
  }
});

module.exports = router;
