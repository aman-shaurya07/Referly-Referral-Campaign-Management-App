import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ReferralSignupPage = () => {
  const { campaignId, promoterEmail } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch campaign details
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/campaigns/${campaignId}`);
        setCampaign(res.data);
      } catch (err) {
        console.error("Failed to fetch campaign");
      }
    };
    fetchCampaign();
  }, [campaignId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) return alert("Please fill in all fields");
    setSubmitting(true);

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/referral/signup`, {
        campaignId,
        promoterEmail,
        name,
        email,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center p-6">
        <h2 className="text-xl font-bold text-green-600">🎉 You're in!</h2>
        <p className="mt-2">Thanks for joining. You'll receive your reward soon!</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow mt-8">
      {campaign ? (
        <>
          <h1 className="text-2xl font-semibold mb-4 text-indigo-700">{campaign.title}</h1>
          <p className="mb-2"><strong>Task:</strong> {campaign.taskDescription}</p>
          <p className="mb-2"><strong>Reward:</strong> {campaign.rewardDescription}</p>
          <p className="mb-6">{campaign.messageToCustomers}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full border p-2 rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
              {submitting ? 'Submitting...' : 'Submit & Claim Reward'}
            </button>
          </form>
        </>
      ) : (
        <p>Loading campaign...</p>
      )}
    </div>
  );
};

export default ReferralSignupPage;
