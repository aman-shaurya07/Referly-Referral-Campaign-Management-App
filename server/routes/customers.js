const express = require("express");
const Referral = require("../models/Referral");
const BusinessCustomer = require("../models/BusinessCustomer");

const router = express.Router();






router.get("/", async (req, res) => {
  try {
    const businessEmail = req.user?.email;

    // 1. Fetch all business customers
    const allCustomers = await BusinessCustomer.find({ businessEmail });

    // 2. Fetch referrals made by these customers
    const allReferrals = await Referral.find({ businessEmail });

    const result = [];

    for (const cust of allCustomers) {
      const stats = {
        name: cust.name,
        email: cust.customerEmail,
        source: cust.source,
        isLoyalCustomer: cust.isLoyal,
        totalReferrals: 0,
        completedTasks: 0,
        redeemedRewards: 0,
      };


      const outgoing = allReferrals.filter((r) => r.referrerEmail === cust.customerEmail);
      const incoming = allReferrals.filter((r) => r.email === cust.customerEmail);

      stats.totalReferrals = outgoing.length;
      stats.completedTasks = incoming.filter((r) => r.completedAt).length;
      stats.redeemedRewards = incoming.filter((r) => r.isRedeemed).length;



      result.push(stats);
    }

    res.json(result);
  } catch (err) {
    console.error("Error fetching full customer list:", err);
    res.status(500).json({ message: "Server error" });
  }
});







router.get("/sync", async (req, res) => {
  try {
    const businessEmail = req.user?.email;

    // Simulated external CRM data (in reality, you’d fetch this via API or Zapier webhook)
    // const externalCustomers = [
    //   { name: "Pooja Mehta", email: "pooja@gmail.com", source: "crm" },
    //   { name: "Ravi Sharma", email: "ravi@outlook.com", source: "crm" },
    //   { name: "Nisha Jain", email: "nisha@yahoo.com", source: "crm" },
    // ];
    const externalCustomers = [
      { name: "Pooja Mehta", email: "pooja@gmail.com", source: "CRM" },
      { name: "Ravi Sharma", email: "ravi@outlook.com", source: "CRM" },
      { name: "Nisha Jain", email: "nisha@yahoo.com", source: "CRM" },
    ];


    let addedCount = 0;

    for (const cust of externalCustomers) {
      // Avoid duplicate entries (based on customer email + business)
      const existing = await BusinessCustomer.findOne({
        customerEmail: cust.email,
        businessEmail,
      });

      if (!existing) {
        await BusinessCustomer.create({
          name: cust.name,
          customerEmail: cust.email,
          businessEmail,
          source: cust.source || "crm",
        });
        addedCount++;
      }
    }

    res.json({ message: `✅ ${addedCount} new customer(s) synced successfully.` });
  } catch (err) {
    console.error("Error syncing customers:", err);
    res.status(500).json({ message: "Error syncing customers" });
  }
});







router.post("/sync-one", async (req, res) => {
  try {
    let businessEmail = req.user?.email;

// Allow Zapier-style requests with secret header
    if (!businessEmail && req.headers["x-zapier-secret"] === process.env.ZAPIER_SECRET) {
      businessEmail = "rohit.anna.r786@gmail.com"; // your real business email
    }

    if (!businessEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }


    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await BusinessCustomer.findOne({ customerEmail: email, businessEmail });

    if (existing) {
      return res.status(200).json({ message: "Customer already exists" });
    }

    await BusinessCustomer.create({
      name,
      customerEmail: email,
      source: "CRM", // Ensure enum match
      businessEmail,
    });

    res.status(201).json({ message: "Customer added successfully" });
  } catch (err) {
    console.error("Error syncing single customer:", err);
    res.status(500).json({ message: "Server error" });
  }
});






module.exports = router;