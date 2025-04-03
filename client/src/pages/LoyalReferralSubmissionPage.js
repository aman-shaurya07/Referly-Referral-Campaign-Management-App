// src/pages/LoyalReferralSubmissionPage.js
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const LoyalReferralSubmissionPage = () => {
  const { campaignId, businessEmail, loyalCustomerEmail } = useParams();
  const [form, setForm] = useState({ newUserName: "", newUserEmail: "" });
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async () => {
    if (!form.newUserName.trim() || !form.newUserEmail.trim()) {
      setMessage("Please fill in both name and email.");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/referral/loyal-submit`, {
        campaignId,
        businessEmail,
        loyalCustomerEmail,  // ✅ matches what backend expects
        newUserName: form.newUserName,
        newUserEmail: form.newUserEmail,
      });
      
      setMessage(res.data.message || "Submitted successfully!");
      setSubmitted(true); 
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10 px-4">
      <div className="bg-white p-6 rounded-lg shadow">
        {!submitted ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">You've been referred!</h2>
            <p className="text-gray-700 text-sm mb-4">
              You were referred by <strong>{loyalCustomerEmail}</strong> from{" "}
              <strong>{businessEmail}</strong>. Fill the form to claim your reward.
            </p>

            <input
              type="text"
              name="newUserName"
              placeholder="Your Name"
              value={form.newUserName}
              onChange={handleChange}
              className="w-full p-2 mb-3 border rounded text-sm"
            />

            <input
              type="email"
              name="newUserEmail"
              placeholder="Your Email"
              value={form.newUserEmail}
              onChange={handleChange}
              className="w-full p-2 mb-4 border rounded text-sm"
            />

            {message && <p className="mb-4 text-red-600 text-sm">{message}</p>}

            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              Submit
            </button>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-600">🎉 Reward Sent via Email!</h3>
            <p className="text-sm mt-2 text-gray-700">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyalReferralSubmissionPage;
