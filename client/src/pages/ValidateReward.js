
import React, { useState } from 'react';
import axios from 'axios';

const ValidateReward = () => {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    setError("");
    setResult(null);

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/referral/validate`, { code });
      setResult(res.data.reward);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-10 bg-white p-6 shadow rounded">
      <h2 className="text-xl font-semibold mb-4 text-center">🎁 Redeem Your Reward</h2>

      <input
        type="text"
        placeholder="Enter your reward code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full border p-2 rounded mb-4 text-sm sm:text-base"
      />

      <button
        onClick={handleCheck}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Validate Reward
      </button>

      {error && <p className="text-red-600 mt-4 text-sm">{error}</p>}

      {result && (
        <div className="mt-6 bg-green-50 border border-green-400 text-green-800 p-4 rounded break-words">
          <h3 className="font-semibold mb-2">✅ Reward Validated!</h3>
          <p className="text-sm sm:text-base">
            <strong>Used by:</strong> <span className="break-all">{result.name} ({result.email})</span>
          </p>
          <p className="text-sm sm:text-base">
            <strong>Campaign:</strong> <span className="break-all">{result.campaignId}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ValidateReward;
