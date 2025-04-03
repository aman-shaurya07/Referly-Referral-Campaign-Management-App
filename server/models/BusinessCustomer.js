const mongoose = require("mongoose");

const businessCustomerSchema = new mongoose.Schema({
  businessEmail: String,
  customerEmail: String,
  source: {
    type: String,
    enum: ['CRM', 'Referral', "Loyal Referral", 'Manual'],
    required: true
  },
  isLoyal: { type: Boolean, default: false },
  name: String
});

module.exports = mongoose.model("BusinessCustomer", businessCustomerSchema);
