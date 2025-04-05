import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [user, setUser] = useState(null);

  const [emailLoyalCustomerMsg, setEmailLoyalCustomerMsg] = useState("");


  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/campaigns`, { withCredentials: true })
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/referral/my-referrals`, { withCredentials: true })
      .then(res => setReferrals(res.data))
      .catch(err => console.error(err));
  }, []);


  const handleSendToLoyalCustomers = async (campaignId) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/referral/email-loyal/${campaignId}`,
        {},
        { withCredentials: true }
      );
  
      const msg = res.data.message;
      setEmailLoyalCustomerMsg(msg); // still update state if needed
      alert(msg || "Emails sent to loyal customers!");
    } catch (err) {
      console.error("Error sending emails to loyal customers", err);
      alert("Something went wrong");
    }
  };
  




  return (
    <div className="p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">📋 All Campaigns</h1>
        <Link
          to="/create-campaign"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
        >
          + Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-600">No campaigns yet. Use “+ Create Campaign” to launch your first one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...campaigns].reverse().map(c => {
            const campaignReferrals = referrals.filter(r => r.campaignId._id === c._id && r.completedAt);

            return (
              <div
                key={c._id}
                className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold mb-2 text-indigo-700">{c.title}</h2>

                <p className="text-sm text-gray-700 mb-1">
                  <strong>Task:</strong> {c.taskDescription}
                </p>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Reward:</strong> {c.rewardDescription}
                </p>
                <p className="text-sm text-gray-700 mb-3">
                  <strong>Message:</strong> {c.messageToCustomers}
                </p>

                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mt-2">
                    <button
                        onClick={() => {
                        navigator.clipboard.writeText(`${process.env.REACT_APP_FRONTEND_URL}/ref/${c._id}/${user.email}`);
                        alert("Referral link copied!");
                        }}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm"
                    >
                        🔗 Copy Referral Link
                    </button>
                    
                    <button
                        onClick={() => handleSendToLoyalCustomers(c._id)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition text-sm"
                    >
                        🎯 Email Loyal Customers
                    </button>
                </div>



                <p className="text-sm text-gray-800 font-semibold">
                  Completed Referrals: {campaignReferrals.length}
                </p>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Task Completed by:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {campaignReferrals.map(r => (
                      <li key={r._id}>✅ {r.email}</li>
                    ))}
                    {campaignReferrals.length === 0 && (
                      <li>No user completed this task yet !!</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignsPage;
