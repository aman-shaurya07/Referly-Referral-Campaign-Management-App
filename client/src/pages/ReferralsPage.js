
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MyReferrals = () => {
  const [referrals, setReferrals] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/referral/my-referrals`, { withCredentials: true })
      .then((res) => setReferrals(res.data))
      .catch((err) => console.error("Failed to load referrals", err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
      <h2 className="text-2xl font-semibold mb-6">My Referrals</h2>

      {referrals.length === 0 ? (
        <p className="text-gray-600">You haven’t referred anyone yet.</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Campaign</th>
                  <th className="p-2 border">Referred Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Status</th>
                  <th className="p-2 border">Completed At</th>
                  <th className="p-2 border">Reward Code</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r._id}>
                    <td className="p-2 border">{r.campaignId?.title || "—"}</td>
                    <td className="p-2 border">{r.name}</td>
                    <td className="p-2 border">{r.email}</td>
                    <td className="p-2 border">
                      {r.isRedeemed ? "✅ Redeemed" : "⏳ Pending"}
                    </td>
                    <td className="p-2 border">
                      {r.completedAt ? new Date(r.completedAt).toLocaleString() : "—"}
                    </td>
                    {/* <td className="p-2 border">{r.isRedeemed ? "—" : r.rewardCode}</td> */}
                    <td className="p-2 border">{r.isRedeemed ? r.rewardCode : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {referrals.map((r) => (
              <div key={r._id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                <p className="text-sm"><strong>Campaign:</strong> {r.campaignId?.title || "—"}</p>
                <p className="text-sm"><strong>Referred Name:</strong> {r.name}</p>
                {/* <p className="text-sm"><strong>Email:</strong> {r.email}</p> */}
                <p className="text-sm truncate max-w-[250px]" title={r.email}>
                  <strong>Email:</strong> {r.email}
                </p>
                <p className="text-sm"><strong>Status:</strong> {r.isRedeemed ? "✅ Redeemed" : "⏳ Pending"}</p>
                <p className="text-sm">
                  <strong>Completed At:</strong> {r.completedAt ? new Date(r.completedAt).toLocaleString() : "—"}
                </p>
                <p className="text-sm"><strong>Reward Code:</strong> {r.isRedeemed ? r.rewardCode: "—"}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyReferrals;
