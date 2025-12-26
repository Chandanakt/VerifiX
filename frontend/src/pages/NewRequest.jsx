import { useState } from "react";
import { auth } from "../firebase"; // Removed 'db' as we use the API now
import { useNavigate } from "react-router-dom";

// Your Render Backend URL
const BACKEND_URL = "https://verifix-backend-sffh.onrender.com";

export default function NewRequest() {
  const [type, setType] = useState("BONAFIDE");
  const [purpose, setPurpose] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  if (!auth.currentUser) {
    return <div>Loading user...</div>;
  }

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a document.");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      // 1. Prepare the payload for the Backend
      const requestData = {
        userId: user.uid,
        userEmail: user.email,
        requestedType: type,
        purpose: purpose,
        attachment: {
          name: file.name,
          mimeType: file.type,
          size: file.size,
        },
        flowType: "REQUEST_NEW"
      };

      // 2. 🔥 CALL THE RENDER BACKEND API
      // This triggers the AI logic in your server.js
      const response = await fetch(`${BACKEND_URL}/createRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Request submitted! AI analysis has been completed by VerifiX.");
        navigate("/student/requests");
      } else {
        throw new Error(result.error || "Failed to trigger AI analysis");
      }

    } catch (err) {
      console.error("Request submission failed:", err);
      alert("Backend error: Make sure your Render server is awake and CORS is configured.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
      <h2 className="text-2xl font-bold mb-4 text-[#1F3B2F]">
        Create Request
      </h2>

      <form onSubmit={submit} className="space-y-4 max-w-lg">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Document Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="BONAFIDE">BONAFIDE</option>
            <option value="TRANSCRIPT">TRANSCRIPT</option>
            <option value="NOC">NOC</option>
            <option value="FEE_RECEIPT">FEE_RECEIPT</option>
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Purpose
          </label>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            className="border p-2 w-full rounded"
            placeholder="Eg: Internship, Visa, Scholarship"
          />
        </div>

        {/* Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Document (For AI scanning)
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1F3B2F] file:text-white hover:file:bg-[#163025]"
          />

          {file && (
            <p className="text-sm text-gray-600 mt-1">
              Selected: {file.name}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#1F3B2F] text-white rounded hover:bg-[#163025] disabled:opacity-50"
        >
          {loading ? "AI Analysis in Progress..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}