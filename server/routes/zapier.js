
const express = require("express");
const router = express.Router();
const BusinessCustomer = require("../models/BusinessCustomer");
const Business = require("../models/Business"); // 👈 needed to verify business
const sendEmail = require("../utils/sendEmail"); // ✅ you're already using this


router.post('/sync-sheet-data', async (req, res) => {
    try {
      const { name, email, editorEmail } = req.body;
  
      if (!name || !email || !editorEmail) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
  
      // ✅ Find business by editor's email
      const business = await Business.findOne({ email: editorEmail });
      if (!business) {
        console.log(`❌ Editor ${editorEmail} tried to sync but has no registered business`);
        await sendEmail(editorEmail, "❌ Sync Failed", `
          <p>We couldn’t sync customers because your email is not associated with any business on Referly.</p>
          <p>Please sign up using this email or contact support.</p>
        `);
        return res.status(404).json({ error: 'Business not found' });
      }
  
      const businessEmail = editorEmail;
  
      // ✅ Check for duplicates
      const exists = await BusinessCustomer.findOne({ customerEmail: email, businessEmail });
      if (exists) {
        return res.status(200).json({ message: 'Customer already exists' });
      }
  
      const newCustomer = new BusinessCustomer({
        businessEmail,
        customerEmail: email,
        name,
        source: 'CRM',
        isLoyal: true,
      });
  
      await newCustomer.save();
  
      console.log(`✅ Customer synced for ${businessEmail}: ${email}`);
      res.status(200).json({ success: true, data: newCustomer });
    } catch (err) {
      console.error('❌ Sync Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

module.exports = router;