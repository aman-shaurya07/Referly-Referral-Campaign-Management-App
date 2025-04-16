

import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";




const AdvancedAnalytics = () => {
  const [campaignAnalytics, setCampaignAnalytics] = useState([]);
  const [crmData, setCrmData] = useState(null);
  const [topReferrers, setTopReferrers] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/referral/analytics`, { withCredentials: true })
      .then((res) => setCampaignAnalytics(res.data))
      .catch((err) => console.error("Failed to load campaign analytics", err));

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/crm/conversion`, { withCredentials: true })
      .then((res) => setCrmData(res.data))
      .catch((err) => console.error("CRM analytics error", err));

    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/referral/top-referrers`, { withCredentials: true })
      .then((res) => setTopReferrers(res.data))
      .catch((err) => console.error("Top referrers error", err));
  }, []);


  console.log("Top referress: ", topReferrers);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 sm:p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">📊 Advanced Analytics Dashboard</h1>

      {/* CRM Summary Cards */}
      {crmData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-600"> CRM / MANUAL Uploaded Customers</p>
            <p className="text-2xl font-bold">{crmData.totalCRMEmails}</p>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-600">Tasks completed by CRM / MANUAL Customers</p>
            <p className="text-2xl font-bold text-green-600">{crmData.matchedReferrals}</p>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-600">CRM Conversion Rate</p>
            <p className="text-2xl font-bold text-blue-600">{crmData.conversionRate} %</p>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <p className="text-sm text-gray-600">Not Converted</p>
            <p className="text-2xl font-bold text-red-500">
              {crmData.totalCRMEmails - crmData.matchedReferrals}
            </p>
          </div>
        </div>
      )}

      


      {campaignAnalytics.length > 0 && (
        <div className="bg-white p-6 mb-10 rounded-xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">📉 Campaign Performance Chart</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={campaignAnalytics.map(c => ({
                name: c.campaignTitle.length > 15 ? c.campaignTitle.slice(0, 15) + "..." : c.campaignTitle,
                Pending: c.pending,
                Redeemed: c.redeemed,
              }))}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pending" fill="#facc15" />
              <Bar dataKey="Redeemed" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>

          {/* Legend Explanation */}
          <div className="flex justify-center mt-4 space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-yellow-400"></div>
              <span>Pending Referrals</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>Redeemed Referrals</span>
            </div>
          </div>
        </div>
      )}






      {/* Campaign Analytics Table */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-10">
        <h2 className="text-2xl font-semibold mb-4">🎯 Campaign Analytics</h2>

        {campaignAnalytics.length === 0 ? (
          <p className="text-gray-600">No data yet. Run a campaign to get insights.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">Campaign</th>
                  <th className="p-3 border">Total Referrals</th>
                  <th className="p-3 border">Pending</th>
                  <th className="p-3 border">Redeemed</th>
                  <th className="p-3 border">Conversion Rate</th>
                </tr>
              </thead>
              <tbody>
                {campaignAnalytics.map((a, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 border font-medium">{a.campaignTitle}</td>
                    <td className="p-3 border">{a.total}</td>
                    <td className="p-3 border text-yellow-600">{a.pending}</td>
                    <td className="p-3 border text-green-600">{a.redeemed}</td>
                    <td className="p-3 border font-semibold">{a.conversionRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      <div className="bg-white p-6 mt-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold mb-4">🏆 Top Referrers</h2>
        {topReferrers.length === 0 ? (
          <p className="text-gray-600">No referrals have been completed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border">Referrer</th>
                  <th className="p-3 border">Completed Tasks</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((referrer, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-3 border font-medium">{referrer._id}</td>
                    <td className="p-3 border">{referrer.completedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>



    </div>
  );
};

export default AdvancedAnalytics;
