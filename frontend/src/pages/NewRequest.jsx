import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

// Updated with your live Render backend URL
const BACKEND_URL = "https://verifix-backend-sffh.onrender.com";

export default function NewRequest() {
  const [type, setType] = useState("BONAFIDE");
  const [purpose, setPurpose] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Protect the route
  if (!auth.currentUser) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Please log in to create a request.</p>
        <button 
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-[#1F3B2F] text-white rounded"
        >
          Go to Login
        </button>
      </div>
    );
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

      // Prepare data for the backend
      const requestData = {
        userId: user.uid,
        userEmail: user.email,
        requestedType: type,
        purpose: purpose,
        // 🔥 NEW FEATURE: Tell backend this is a verification flow (triggers AI)
        flowType: "VERIFICATION", 
        attachment: {
          name: file.name,
          mimeType: file.type,
          size: file.size,
        }
      };

      const response = await fetch(`${BACKEND_URL}/createRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Backend failed to process request");
      }

      const result = await response.json();
      console.log("3. Backend success! ID:", result.id);

      alert("Request submitted successfully! AI analysis is complete.");
      navigate("/student/requests");

    } catch (err) {
      console.error("❌ Submission failed:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
      <h2 className="text-2xl font-bold mb-4 text-[#1F3B2F]">
        Create New Request
      </h2>

      <form onSubmit={submit} className="space-y-4 max-w-lg">
        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#1F3B2F]">
            Document Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-[#1F3B2F] outline-none"
          >
            <option value="BONAFIDE">BONAFIDE</option>
            <option value="TRANSCRIPT">TRANSCRIPT</option>
            <option value="NOC">NOC</option>
            <option value="FEE_RECEIPT">FEE_RECEIPT</option>
          </select>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium mb-1 text-[#1F3B2F]">
            Purpose of Request
          </label>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
            className="border p-2 w-full rounded focus:ring-2 focus:ring-[#1F3B2F] outline-none"
            placeholder="e.g., Internship, Visa, Scholarship"
          />
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-[#D9F3E6] p-4 rounded-lg bg-white">
          <label className="block text-sm font-medium mb-2 text-[#1F3B2F]">
            Upload Document (PDF or Image)
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#D9F3E6] file:text-[#1F3B2F]
              hover:file:bg-[#bcecd4]"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              📄 Selected: <strong>{file.name}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            loading 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-[#1F3B2F] text-white hover:bg-[#163025] shadow-md"
          }`}
        >
          {loading ? "🤖 AI Analysis Triggering..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}