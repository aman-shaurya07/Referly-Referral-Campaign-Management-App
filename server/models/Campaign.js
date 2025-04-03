const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
  business: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
  title: String,
  taskDescription: String,
  rewardDescription: String,
  messageToCustomers: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clicks: {
    type: Number,
    default: 0
  }
  
});

module.exports = mongoose.model("Campaign", campaignSchema);
