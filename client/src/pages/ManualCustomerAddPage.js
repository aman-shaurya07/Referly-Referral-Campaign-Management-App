


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadCRM = () => {
  const [file, setFile] = useState(null);
  const [csvMessage, setCsvMessage] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [single, setSingle] = useState({ name: "", email: "" });

  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/crm/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setCsvMessage(res.data.message);
    } catch (err) {
      setCsvMessage(err.response?.data?.message || "Failed to add customer");
    }
  };

  const handleSingleAdd = async () => {
    if (!single.name.trim() || !single.email.trim()) {
      return setFormMessage("Please enter both name and email.");
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/crm/add-single`, single, {
        withCredentials: true,
      });
      setFormMessage(res.data.message);
      setSingle({ name: "", email: "" });
    } catch (err) {
      setFormMessage(err.response?.data?.message || "Failed to add customer");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 rounded-lg shadow space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">📤 Add Customers</h2>
          <button
            onClick={() => navigate("/customers")}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 text-sm"
          >
            ⬅ Back to Customers
          </button>
        </div>

        {/* CSV Upload */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Upload via CSV</h3>
          <form onSubmit={handleUpload}>
            <label className="block mb-1 text-sm text-gray-700">CSV File (with name, email):</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mb-3 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-sm"
            >
              Upload CSV
            </button>
          </form>
          {csvMessage && <p className="mt-3 text-sm text-green-700">{csvMessage}</p>}
        </div>

        {/* Manual Entry */}
        <div className="border p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Add a Single Customer</h3>
          <label className="block mb-1 text-sm text-gray-700">Name</label>
          <input
            type="text"
            value={single.name}
            onChange={(e) => setSingle({ ...single, name: e.target.value })}
            className="w-full mb-3 border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Customer Name"
          />
          <label className="block mb-1 text-sm text-gray-700">Email</label>
          <input
            type="email"
            value={single.email}
            onChange={(e) => setSingle({ ...single, email: e.target.value })}
            className="w-full mb-3 border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Customer Email"
          />
          <button
            type="button"
            onClick={handleSingleAdd}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition text-sm"
          >
            ➕ Add Single Customer
          </button>
          {formMessage && <p className="mt-3 text-sm text-green-700">{formMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default UploadCRM;
