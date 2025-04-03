const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  profilePic: String,
});

module.exports = mongoose.model("Business", businessSchema);
