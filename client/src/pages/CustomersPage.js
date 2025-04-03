import React, { useEffect, useState } from "react";
import axios from "axios";

const CustomersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/customers`, { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users", err));
  }, []);

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Customers List</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-all"
          >
            {/* <h2 className="text-lg font-semibold text-indigo-700">{user.name}</h2> */}
            <h2 className="text-lg font-semibold text-indigo-700">
              {user.name}{" "}
              {user.isLoyalCustomer && (
                <span className="ml-2 text-xs px-2 py-1 bg-yellow-300 text-yellow-800 rounded-full font-medium">
                  ⭐ Loyal Customer
                </span>
              )}
            </h2>

            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            <p className="text-xs text-gray-500 italic">({user.source})</p>
            <div className="mt-4 text-sm space-y-1">
              <p>🔗 Referrals Made: {user.totalReferrals || 0}</p>
              <p>✅ Completed Tasks: {user.completedTasks || 0}</p>
              <p>🏆 Rewards Redeemed: {user.redeemedRewards || 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomersPage;
