

// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";



const Dashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [user, setUser] = useState(null);


  const [campaignAnalytics, setCampaignAnalytics] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/referral/analytics`, { withCredentials: true })
      .then((res) => setCampaignAnalytics(res.data))
      .catch((err) => console.error("Failed to load campaign analytics", err));
  }, []);




  useEffect(() => { 
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/me`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/campaigns`, { withCredentials: true })
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err));

    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/referral/my-referrals`, { withCredentials: true })
      .then(res => setReferrals(res.data))
      .catch(err => console.error(err));
  }, []);



  const handleSendToLoyalCustomers = async (campaignId) => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/referral/email-loyal/${campaignId}`, {}, {
        withCredentials: true,
      });
      alert("Emails sent to loyal customers!");
    } catch (err) {
      console.error("Error sending emails to loyal customers", err);
      alert("Something went wrong");
    }
  };
  




  console.log(user);

  const totalCompletedTasks = referrals.filter(r => r.businessEmail === user?.email && r.completedAt).length;
  const totalRedeemed = referrals.filter(r => r.businessEmail === user?.email &&  r.isRedeemed).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">📈 Campaigns</div>
          <div className="text-2xl text-indigo-600 font-bold">{campaigns.length}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">🤝 Referrals</div>
          <div className="text-2xl text-indigo-600 font-bold">{referrals.length}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">✅ Completed</div>
          <div className="text-2xl text-indigo-600 font-bold">{totalCompletedTasks}</div>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">🏆 Redeemed</div>
          <div className="text-2xl text-indigo-600 font-bold">{totalRedeemed}</div>
        </div>
      </div>


      {/* 1.5 Completion Overview Pie Chart */}
      <div className="bg-white p-4 rounded-xl shadow mb-10">
        <h2 className="text-lg font-semibold mb-4">📊 Campaign Completion Overview</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                dataKey="value"
                data={[
                  {
                    name: "Completed",
                    value: campaignAnalytics.reduce((sum, c) => sum + parseInt(c.redeemed || 0), 0),
                  },
                  {
                    name: "Pending",
                    value: campaignAnalytics.reduce((sum, c) => sum + parseInt(c.pending || 0), 0),
                  },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                <Cell fill="#4ade80" /> {/* Green for completed */}
                <Cell fill="#facc15" /> {/* Yellow for pending */}
              </Pie>
              <Tooltip />
            </PieChart>
            {/* Chart Legend */}
            <div className="flex justify-center mt-4 space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Reward Redeemed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                <span>Pending Redemption</span>
              </div>
            </div>

          </ResponsiveContainer>
        </div>
      </div>




      {/* 2. Recent Campaigns */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Campaigns</h2>
          <Link to="/campaigns" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...campaigns].reverse().slice(0, 3).map(c => {
            const completed = referrals.filter(r => r.campaignId._id === c._id && r.completedAt);
            return (
              <div key={c._id} className="bg-white border rounded-xl p-4 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">{c.title}</h3>
                <p className="text-sm mb-1"><strong>Task:</strong> {c.taskDescription}</p>
                <p className="text-sm mb-1"><strong>Reward:</strong> {c.rewardDescription}</p>
                <p className="text-sm mb-2 text-gray-600"><strong>Completed:</strong> {completed.length}</p>
                
                {user && (
                  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000/ref/${c._id}/${user.email}`);
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
                  
                )}


              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Referral Activity Snapshot */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Referrals</h2>
          <Link to="/my-referrals" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="bg-white shadow rounded-xl overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Redemption Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.slice(0, 5).map(r => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.isRedeemed ? '✅ Redeemed' : '⏳ Pending'}</td>
                  <td className="p-3">{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      


    </div>
  );
};

export default Dashboard;
