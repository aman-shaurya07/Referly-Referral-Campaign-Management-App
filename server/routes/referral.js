

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









// Route: /api/referral/loyal-submit
router.post("/loyal-submit", async (req, res) => {
  const { campaignId, businessEmail, loyalCustomerEmail, newUserName, newUserEmail } = req.body;

  if (!campaignId || !businessEmail || !loyalCustomerEmail || !newUserName || !newUserEmail) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Prevent duplicate referral for same user and campaign

    const alreadyCustomer = await BusinessCustomer.findOne({
      businessEmail,
      customerEmail: newUserEmail,
    });

    if (alreadyCustomer) {
      return res.status(400).json({ message: "This user is already a customer of the business" });
    }





    const alreadyReferred = await Referral.findOne({
      campaignId,
      email: newUserEmail,
    });

    if (alreadyReferred) {
      return res.status(400).json({ message: "User already referred for this campaign" });
    }

    // Add referral entry
    const rewardCode = uuidv4().slice(0, 8);

    const referral = new Referral({
      campaignId,
      businessEmail,
      referrerEmail: loyalCustomerEmail,
      name: newUserName,
      email: newUserEmail,
      rewardCode,
    });

    await referral.save();


    await axios.post(taskZapUrl, {
      email: newUserEmail,
      name:newUserName,
      campaignId,
      rewardCode,
      completedAt: referral.completedAt,
      businessEmail,
    });

    // Send email to new user
    const newUserHTML = `
      <h3>🎉 You've been referred by a loyal customer!</h3>
      <p>Thanks for joining us, ${newUserName}.</p>
      <p><strong>Your Reward Code:</strong> ${rewardCode}</p>
      <p>You can redeem it here: <a href="${process.env.FRONTEND_URL}/validate-reward">Redeem Now</a></p>
    `;

    await sendEmail(newUserEmail, "Welcome! Here's your reward 🎁", newUserHTML);

    // Send email to loyal customer
    const loyalCustomerHTML = `
      <h3>✅ Your referral was successful!</h3>
      <p>You referred <strong>${newUserEmail}</strong>.</p>
      <p><strong>Your Reward Code:</strong> ${rewardCode}</p>
      <p>Redeem it here: <a href="${process.env.FRONTEND_URL}/validate-reward">Redeem Now</a></p>
    `;

    await sendEmail(loyalCustomerEmail, "Thanks for referring! 🎁", loyalCustomerHTML);

    // Save user to business customers (if not exists)
    const exists = await BusinessCustomer.findOne({
      businessEmail,
      customerEmail: newUserEmail,
    });

    if (!exists) {
      await BusinessCustomer.create({
        businessEmail,
        customerEmail: newUserEmail,
        name: newUserName,
        source: "Loyal Referral",
      });
    }

    return res.status(200).json({ message: "Referral submitted successfully" });
  } catch (err) {
    console.error("Loyal Referral error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});








const Campaign = require('../models/Campaign');


// ✅ Helper: Mark customers as loyal
const markLoyalCustomers = async (businessEmail) => {
  const customers = await BusinessCustomer.find({ businessEmail });

  for (const customer of customers) {
    const completedReferrals = await Referral.countDocuments({
      businessEmail,
      email: customer.customerEmail,
      completedAt: { $exists: true },
    });

    if (completedReferrals >= 2 && !customer.isLoyal) {
      customer.isLoyal = true;
      await customer.save();
    }
  }
};

// ✅ API: Send referral links to loyal customers
router.post("/email-loyal/:campaignId", async (req, res) => {
  try {
    const businessEmail = req.user?.email;
    const { campaignId } = req.params;



    // Step 1: Mark loyal customers
    await markLoyalCustomers(businessEmail);

    // Step 2: Fetch campaign info
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Step 3: Find loyal customers
    const loyalCustomers = await BusinessCustomer.find({
      businessEmail,
      isLoyal: true,
    });

    if (loyalCustomers.length === 0) {
      return res.status(200).json({ message: "No loyal customers found." });
    }

    // Step 4: Send email to each loyal customer
    for (const customer of loyalCustomers) {
      const referralLink = `${process.env.FRONTEND_URL}/ref-loyal/${campaignId}/${businessEmail}/${customer.customerEmail}`;

      const html = `
        <h3>🎉 Refer & Earn Again!</h3>
        <p>As a loyal customer, you can earn more rewards!</p>
        <p>Share this link with your friends:</p>
        <p><a href="${referralLink}" target="_blank">${referralLink}</a></p>
        <p>Every time someone joins using your link, both of you earn rewards!</p>
      `;

      await sendEmail(customer.customerEmail, "Your Special Referral Link 🎁", html);
    }

    res.json({ message: "Referral emails sent to loyal customers." });
  } catch (err) {
    console.error("Error emailing loyal customers:", err);
    res.status(500).json({ message: "Failed to send referral links" });
  }
});







module.exports = router;

