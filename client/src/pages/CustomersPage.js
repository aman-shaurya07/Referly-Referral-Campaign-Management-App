

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomersPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  
  const fetchUsers = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_URL}/api/customers`, { withCredentials: true })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users", err));
  };

  useEffect(() => {
    fetchUsers();

  }, []);


  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers List</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/upload-crm")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            ➕ Add Customer
          </button>
          <a
            href="https://docs.google.com/spreadsheets/d/1d81cGjNh0daK-iii670vAy7AIVlM5qZkPIeFzt4tJVs/copy"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            📋 Get Google Sheet Template
          </a>


          <a
            href="https://docs.google.com/document/d/14-uliElVTn1ytcSsw5axkWfibJuCmNObViEpRT2OQaw/edit?usp=sharing" // Replace with your actual guide URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm hover:text-blue-800"
          >
            ℹ️ How to Use This Template
          </a>

        </div>
      </div>





      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white rounded-xl shadow p-4 hover:shadow-md transition-all"
          >
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
