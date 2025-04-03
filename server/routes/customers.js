const express = require("express");
const Referral = require("../models/Referral");
const BusinessCustomer = require("../models/BusinessCustomer");

const router = express.Router();





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




router.get("/", async (req, res) => {
  try {
    const businessEmail = req.user?.email;

    await markLoyalCustomers(businessEmail);


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

      // const outgoing = allReferrals.filter((r) => r.referrerEmail === cust.customerEmail);
      // stats.totalReferrals = outgoing.length;
      // stats.completedTasks = outgoing.filter((r) => r.completedAt).length;
      // stats.redeemedRewards = outgoing.filter((r) => r.isRedeemed).length;



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

module.exports = router;
