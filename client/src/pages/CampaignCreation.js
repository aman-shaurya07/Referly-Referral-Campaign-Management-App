
import React, { useState } from 'react';
import axios from 'axios';

const CampaignCreation = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '',
    taskDescription: '',
    rewardDescription: '',
    messageToCustomers: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    // Step-wise validation
    if (step === 1 && (!form.title.trim() || !form.taskDescription.trim())) {
      alert("Please fill in both campaign title and task description.");
      return;
    }
    if (step === 2 && !form.rewardDescription.trim()) {
      alert("Please provide a reward description.");
      return;
    }
    if (step === 3 && !form.messageToCustomers.trim()) {
      alert("Please enter a message for customers.");
      return;
    }

    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/campaigns`, form, { withCredentials: true });
      alert("Campaign created!");
      window.location.href = "/";
    } catch (err) {
      alert("Failed to create campaign.");
      console.log(err);
    }
  };

  const handleAI = async () => {
    const userPrompt = prompt("Describe your campaign goal (e.g. get more reviews, invite friends, etc.)");
    if (!userPrompt) return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/ai/generate`, {
        prompt: `
You are a helpful marketing assistant.

Given a campaign goal, respond ONLY with a valid JSON object inside triple backticks like this:

\`\`\`json
{
  "title": "...",
  "taskDescription": "...",
  "rewardDescription": "...",
  "messageToCustomers": "..."
}
\`\`\`

Goal: ${userPrompt}
        `
      });

      setForm(res.data);
      alert("AI-generated campaign fields have been filled!");
    } catch (err) {
      alert("AI failed to generate. Try again.");
      console.log(err);
    }
  };

  const steps = ['Basics', 'Reward', 'Message', 'Review'];

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-4 sm:p-6 md:p-8 mt-6">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-800">Create New Campaign</h2>

      {/* AI Assistant */}
      <div className="mb-6 text-right">
        <button
          onClick={handleAI}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
        >
          🪄 Generate with AI
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex flex-wrap gap-2 mb-6">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`text-sm px-3 py-1 rounded-full border ${
              step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Step {i + 1}: {label}
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Campaign Basics</h3>
          <input
            type="text"
            name="title"
            placeholder="Campaign Title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4 text-sm"
          />
          <input
            type="text"
            name="taskDescription"
            placeholder="Task Description"
            value={form.taskDescription}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
          />
          <div className="flex justify-end mt-4">
            <button onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Next</button>
          </div>
        </>
      )}

      {/* Step 2: Reward */}
      {step === 2 && (
        <>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Reward Setup</h3>
          <input
            type="text"
            name="rewardDescription"
            placeholder="Reward Description (e.g., 20% off)"
            value={form.rewardDescription}
            onChange={handleChange}
            className="w-full p-2 border rounded text-sm"
          />
          <div className="flex justify-between mt-4">
            <button onClick={prevStep} className="px-4 py-2 rounded border border-gray-300 text-sm">Back</button>
            <button onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Next</button>
          </div>
        </>
      )}

      {/* Step 3: Message */}
      {step === 3 && (
        <>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Customer Message</h3>
          <textarea
            name="messageToCustomers"
            placeholder="Message for existing customers"
            value={form.messageToCustomers}
            onChange={handleChange}
            className="w-full p-2 border rounded h-28 text-sm"
          />
          <div className="flex justify-between mt-4">
            <button onClick={prevStep} className="px-4 py-2 rounded border border-gray-300 text-sm">Back</button>
            <button onClick={nextStep} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">Next</button>
          </div>
        </>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Review Campaign</h3>
          <div className="bg-gray-50 p-4 rounded space-y-2 text-sm text-gray-700">
            <p><strong>Title:</strong> {form.title}</p>
            <p><strong>Task:</strong> {form.taskDescription}</p>
            <p><strong>Reward:</strong> {form.rewardDescription}</p>
            <p><strong>Message:</strong> {form.messageToCustomers}</p>
          </div>
          <div className="flex justify-between mt-4">
            <button onClick={prevStep} className="px-4 py-2 rounded border border-gray-300 text-sm">Back</button>
            <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">Launch Campaign</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignCreation;
