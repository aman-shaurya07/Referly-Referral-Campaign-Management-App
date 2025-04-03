const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    required: true,
  },
  businessEmail: {
    type: String,
    required: true, // ✅ Always present, even if referral is from a loyal customer
  },
  referrerEmail: {
    type: String,
    required: true, // ✅ Can be the business owner or a loyal customer
  },
  name: String,          // name of the new user
  email: String,         // email of the new user
  rewardCode: String,
  completedAt: {
    type: Date,
    default: Date.now,
  },
  isRedeemed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Referral", referralSchema);
