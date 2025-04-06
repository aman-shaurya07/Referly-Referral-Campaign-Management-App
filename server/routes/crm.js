const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const router = express.Router();
const BusinessCustomer = require('../models/BusinessCustomer');
const Referral = require('../models/Referral');



const upload = multer({ dest: 'uploads/' });
const path = require('path');

router.post('/upload', upload.single('file'), async (req, res) => {

  if (!req.user || !req.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const businessEmail = req.user.email;
  const filePath = req.file.path;
  const customers = [];
  let headersValid = false;

  try {
    const parser = fs.createReadStream(filePath).pipe(csv());

    parser.on('headers', (headers) => {
      const normalized = headers.map((h) => h.trim().toLowerCase());
      if (normalized.includes('name') && normalized.includes('email')) {
        headersValid = true;
      }
    });

    parser.on('data', (row) => {
      if (!headersValid) return; // Skip if headers are invalid

      const name = row.name?.trim();
      const email = row.email?.trim();

      if (
        name &&
        email &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        customers.push({
          businessEmail,
          customerEmail: email,
          name,
          source: "Manual",
          isLoyal:true
        });
      }
    });

    parser.on('end', async () => {
      fs.unlinkSync(filePath);

      if (!headersValid) {
        return res.status(400).json({
          message: "Invalid CSV format. Required headers: name, email",
        });
      }

      if (customers.length === 0) {
        return res.status(400).json({
          message: "No valid rows found in the CSV file.",
        });
      }

      try {
        const existing = await BusinessCustomer.find({ businessEmail });
        const existingEmails = new Set(existing.map((c) => c.customerEmail));

        const uniqueCustomers = customers.filter((c) => !existingEmails.has(c.customerEmail));

        if (uniqueCustomers.length > 0) {
          await BusinessCustomer.insertMany(uniqueCustomers, { ordered: false });
        }

        return res.json({
          message: `${uniqueCustomers.length} valid customers uploaded successfully!`,
        });
      } catch (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ message: "Error saving customers" });
      }
    });

    parser.on('error', (err) => {
      console.error("CSV parse error:", err);
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Invalid CSV structure" });
    });
  } catch (err) {
    console.error("Upload handler error:", err);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(500).json({ message: "Unexpected server error" });
  }
});













  router.post("/add-single", async (req, res) => {
    const { name, email } = req.body;
  
    if (!req.user || !req.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    const businessEmail = req.user?.email;
  
    if (!email?.trim() || !name?.trim()) {
      return res.status(400).json({ message: "Name and email required" });
    }
  
    try {
      const exists = await BusinessCustomer.findOne({ businessEmail, customerEmail: email.trim() });
  
      if (exists) {
        return res.status(400).json({ message: "Customer already exists" });
      }
  
      await BusinessCustomer.create({
        businessEmail,
        customerEmail: email.trim(),
        name: name.trim(),
        source: "Manual",
        isLoyal:true
      });
  
      res.status(200).json({ message: "Customer added successfully!" });
    } catch (err) {
      console.error("Single add error:", err);
      res.status(500).json({ message: "Failed to add customer" });
    }
  });
  










router.get("/conversion", async (req, res) => {
    try {
      const businessEmail = req.user?.email;
  
      const crmEmails = await BusinessCustomer.find({
        businessEmail,
        source: { $in: ["CRM", "Manual"] }
      });
  
      const referralEmails = await Referral.find({
        referrerEmail: businessEmail
      }).distinct("email");
  
      const matched = crmEmails.filter(entry => referralEmails.includes(entry.customerEmail));
  
      res.json({
        totalCRMEmails: crmEmails.length,
        matchedReferrals: matched.length,
        conversionRate: crmEmails.length === 0 ? 0 : ((matched.length / crmEmails.length) * 100).toFixed(2),
        notConverted: crmEmails.length - matched.length
      });
    } catch (err) {
      console.error("CRM analytics error", err);
      res.status(500).json({ message: "CRM analytics failed" });
    }
  });

  


module.exports = router;
