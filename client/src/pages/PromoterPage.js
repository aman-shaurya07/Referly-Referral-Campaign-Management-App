// src/pages/PromoterPage.jsx

// 💡 Added AI subject/body generation feature - under test


import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PromoterPage = () => {
  const { campaignId, promoterEmail } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/campaigns/${campaignId}`);
        setCampaign(res.data);
      } catch (err) {
        console.error("Error fetching campaign", err);
      }
    };
    fetchCampaign();
  }, [campaignId]);

  const handleGenerateWithAI = async () => {
    if (!prompt.trim()) return alert("Please describe your idea");
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/ai/promoter`, {
        prompt,
        campaignId,
      });
      const { subject, body } = res.data;
      setSubject(subject);
      setBody(body);
    } catch (err) {
      alert("AI failed to generate.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail || !subject || !body) return alert("All fields are required");
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/send-email-friend`, {
        friendEmail: recipientEmail,
        promoterEmail,
        campaignId,
        subject,
        body,
      });
      alert("Email sent successfully");
      setRecipientEmail("");
    } catch (err) {
      alert("Failed to send email");
      console.error(err);
    }
  };
  

  if (!campaign) return <div className="p-6">Loading campaign...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Promote Campaign: {campaign.title}</h2>

      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Task:</strong> {campaign.taskDescription}</p>
        <p><strong>Reward:</strong> {campaign.rewardDescription}</p>
        <p>{campaign.messageToCustomers}</p>
      </div>

      <div>
        <label className="text-sm font-medium">🎯 Describe how you want to promote:</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. I want to share this offer with friends who love coffee"
          className="w-full border p-2 rounded mt-1 mb-2 text-sm"
        />
        <button
          onClick={handleGenerateWithAI}
          className="bg-purple-600 text-white px-4 py-2 rounded text-sm"
          disabled={loading}
        >
          {loading ? "Generating..." : "✨ Generate Email with AI"}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium">✉️ Recipient's Email</label>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="friend@example.com"
          className="w-full border p-2 rounded mt-1 mb-2 text-sm"
        />

        <label className="block text-sm font-medium">📌 Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full border p-2 rounded mt-1 mb-2 text-sm"
        />

        <label className="block text-sm font-medium">📝 Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full border p-2 rounded h-32 mt-1 mb-2 text-sm"
        />

        <button
          onClick={handleSendEmail}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
        >
          📤 Send Email
        </button>
      </div>
    </div>
  );
};

export default PromoterPage;
