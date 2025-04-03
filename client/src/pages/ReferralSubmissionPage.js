
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ReferralSubmissionPage = () => {
  const { campaignId, referrerEmail } = useParams();
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);
  // const [rewardCode, setRewardCode] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  };

  const handleSubmit = async () => {
    // 🔒 Basic Validation
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please fill in both your name and email.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/referral/submit`, {
        ...form,
        businessEmail: referrerEmail,
        campaignId,
        referrerEmail,
      });
      // setRewardCode(res.data.rewardCode);
      setSubmitted(true);
    } catch (err) {
      if (err.response?.data?.message === "You've already completed this campaign!") {
        setError("You've already completed this campaign. You cannot earn the reward again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 rounded-lg shadow">
        {!submitted ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center sm:text-left">
              Claim Your Reward
            </h2>
            <p className="mb-4 text-gray-700 text-sm sm:text-base break-words whitespace-pre-wrap">
              You were referred by{" "}
              <strong className="break-all">{referrerEmail}</strong>. Fill the form to complete your signup and unlock your reward!
            </p>

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="w-full mb-3 p-2 border rounded text-sm"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={form.email}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded text-sm"
            />

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-300">
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-green-600 mb-2">🎉 You’ve earned a reward!</h3>
            <p className="text-gray-700 text-sm sm:text-base">
              {/* Your reward code:
              <span className="block mt-2 font-mono font-bold text-lg text-blue-700">
                {rewardCode}
              </span> */}
              Check Your Email To Claim The Reward  
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralSubmissionPage;
