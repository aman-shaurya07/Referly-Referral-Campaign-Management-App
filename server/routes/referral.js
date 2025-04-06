

const express = require("express");
const router = express.Router();
const Referral = require("../models/Referral");
const { v4: uuidv4 } = require("uuid");
const BusinessCustomer = require("../models/BusinessCustomer");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");


const taskZapUrl = process.env.ZAPIER_TASK_COMPLETED_URL;
const rewardZapUrl = process.env.ZAPIER_REWARD_REDEEMED_URL


router.post("/submit", async (req, res) => {
  const { name, email, campaignId, referrerEmail } = req.body;

  if (!campaignId || !referrerEmail || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // ✅ Prevent user from submitting for the same campaign twice
    const existingReferral = await Referral.findOne({
      campaignId,
      email,
    });

    if (existingReferral) {
      return res.status(400).json({
        message: "You've already completed this campaign!",
      });
    }

    // ✅ Create the referral entry
    const rewardCode = uuidv4().slice(0, 8);
    const referral = new Referral({
      campaignId,
      businessEmail: referrerEmail,
      referrerEmail,
      name,
      email,
      rewardCode,
      completedAt: new Date(), // ✅ ADD THIS
    });
    await referral.save();


  

    // ✅ Send to Zapier webhook
    await axios.post(taskZapUrl, {
      businessEmail: referrerEmail,
      email,
      name,
      campaignId,
      rewardCode,
      completedAt: referral.completedAt,
    });

    // ✅ Send email with reward code
    const html = `
      <h3>🎉 You've earned a reward!</h3>
      <p>Thanks for completing the task.</p>
      <p><strong>Your Reward Code:</strong> ${rewardCode}</p>
      <p>You can redeem it here: <a href="${process.env.FRONTEND_URL}/validate-reward">Validate Reward</a></p>
    `;
    await sendEmail(email, "Your Reward Code 🎁", html);

    // ✅ Add to BusinessCustomer if not already added
    const isExistingCustomer = await BusinessCustomer.findOne({
      businessEmail: referrerEmail,
      customerEmail: email,
    });

    if (!isExistingCustomer) {
      await BusinessCustomer.create({
        businessEmail: referrerEmail,
        customerEmail: email,
        name,
        source: "Referral",
      });
    }

    return res
      .status(200)
      .json({ message: "Submitted and email sent", rewardCode });

  } catch (err) {
    console.error("Referral submit error:", err);
    return res.status(500).json({ message: "Submission failed" });
  }
});












router.post("/validate", async (req, res) => {
  const { code } = req.body;

  try {
    const referral = await Referral.findOne({ rewardCode: code });

    if (!referral) {
      return res.status(404).json({ message: "Invalid reward code" });
    }

    if (referral.isRedeemed) {
      return res.status(400).json({ message: "Reward already redeemed" });
    }

    referral.isRedeemed = true;
    referral.completedAt = new Date(); // ✅ Add this
    await referral.save();

    await axios.post(rewardZapUrl, {
      businessEmail:referral.businessEmail, 
      email: referral.email,
      name: referral.name,
      campaignId: referral.campaignId,
      rewardCode: referral.rewardCode,
      completedAt: referral.completedAt,
      referrerEmail: referral.referrerEmail
    });

    return res.status(200).json({
      message: "Reward Validated!",
      reward: {
        name: referral.name,
        email: referral.email,
        campaignId: referral.campaignId,
        isRedeemed: referral.isRedeemed
      }
    });
  } catch (err) {
    console.error("Reward validation error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});







router.get("/my-referrals", async (req, res) => {

  if (!req.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userEmail = req.user?.email;

  try {
    const referrals = await Referral.find({ businessEmail: userEmail })
      .populate("campaignId", "title")
      .sort({ completedAt: -1 });

    res.status(200).json(referrals);
  } catch (err) {
    console.error("My Referrals Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});









router.get("/analytics", async (req, res) => {
  if (!req.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userEmail = req.user?.email;

  try {
    const referrals = await Referral.find({ businessEmail: userEmail }).populate("campaignId", "title");

    const analytics = {};

    referrals.forEach((ref) => {
      const campaignId = ref.campaignId?._id;
      const title = ref.campaignId?.title || "Untitled";

      if (!analytics[campaignId]) {
        analytics[campaignId] = {
          campaignTitle: title,
          total: 0,
          redeemed: 0,
          pending: 0
        };
      }

      analytics[campaignId].total++;
      if (ref.isRedeemed) {
        analytics[campaignId].redeemed++;
      } else {
        analytics[campaignId].pending++;
      }
    });

    const result = Object.values(analytics).map((entry) => ({
      ...entry,
      conversionRate:
        entry.total === 0 ? "0%" : `${Math.round((entry.redeemed / entry.total) * 100)}%`,
    }));

    return res.json(result);
  } catch (err) {
    console.error("Analytics fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});






// GET /api/referral/top-referrers
router.get("/top-referrers", async (req, res) => {
  try {
    const pipeline = [
      {
        $match: { completedAt: { $ne: null } },
      },
      {
        $group: {
          _id: "$businessEmail",
          completedCount: { $sum: 1 },
        },
      },
      {
        $sort: { completedCount: -1 },
      },
      {
        $limit: 5,
      },
    ];

    const results = await Referral.aggregate(pipeline);

    res.json(results);
  } catch (err) {
    console.error("Top referrers aggregation error:", err);
    res.status(500).json({ message: "Failed to load top referrers" });
  }
});

module.exports = router;





router.post("/signup", async (req, res) => {
  try {
    const { campaignId, promoterEmail, name, email } = req.body;

    if (!campaignId || !promoterEmail || !name || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Get campaign + business
    const campaign = await Campaign.findById(campaignId).populate("business");
    if (!campaign || !campaign.business) {
      return res.status(404).json({ message: "Campaign not found or has no business" });
    }

    const businessEmail = campaign.business.email;

    // ✅ If already a customer → no referral allowed
    const alreadyCustomer = await BusinessCustomer.findOne({ customerEmail: email, businessEmail });
    if (alreadyCustomer) {
      return res.status(400).json({
        message: "This user is already a customer of this business and can't be referred again.",
      });
    }

    // ✅ If already completed this campaign before → don't allow again
    const existingReferral = await Referral.findOne({
      campaignId,
      email,
    });

    if (existingReferral) {
      return res.status(400).json({ message: "You've already completed this campaign!" });
    }

    // ✅ Create referral
    const rewardCode = uuidv4().slice(0, 8);
    const referral = await Referral.create({
      campaignId,
      businessEmail,
      referrerEmail: promoterEmail,
      name,
      email,
      rewardCode,
      completedAt: new Date(),
    });

    // ✅ Create new BusinessCustomer
    await BusinessCustomer.create({
      name,
      customerEmail: email,
      businessEmail,
      source: "Promoter",
    });

    // ✅ Notify CRM/Zapier
    await axios.post(taskZapUrl, {
      businessEmail,
      email,
      name,
      campaignId,
      rewardCode,
      completedAt: referral.completedAt,
    });

    // ✅ Send reward email to new user
    const htmlNewUser = `
      <h3>🎉 You've earned a reward!</h3>
      <p>Thanks for completing the task.</p>
      <p><strong>Your Reward Code:</strong> ${rewardCode}</p>
      <p>You can redeem it here: <a href="${process.env.FRONTEND_URL}/validate-reward">Validate Reward</a></p>
    `;
    await sendEmail(email, "Your Reward Code 🎁", htmlNewUser);

    // ✅ Send reward email to promoter
    const htmlPromoter = `
      <h3>🎉 Thanks, your friend just joined!</h3>
      <p>As a promoter, here's your reward code:</p>
      <p><strong>Your Reward Code:</strong> ${rewardCode}</p>
      <p>You can redeem it here: <a href="${process.env.FRONTEND_URL}/validate-reward">Validate Reward</a></p>
    `;
    await sendEmail(promoterEmail, "Your Promoter Reward 🎁", htmlPromoter);

    return res.status(200).json({
      message: "🎉 Submitted and reward email sent!",
      rewardCode,
    });

  } catch (err) {
    console.error("❌ Error in referral signup:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
});






  module.exports = router;


