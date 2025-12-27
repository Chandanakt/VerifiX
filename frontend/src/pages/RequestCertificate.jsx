import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

// Ensure this matches your Render backend URL
const BACKEND_URL = "https://verifix-backend-sffh.onrender.com";

export default function RequestCertificate() {
  const [type, setType] = useState("BONAFIDE");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = auth.currentUser;

  const submit = async (e) => {
    e.preventDefault();
    if (!purpose) return alert("Purpose is required");

    try {
      setLoading(true);

      // 🔥 Prepare the payload for the Backend
      const requestData = {
        userId: user.uid,
        userEmail: user.email,
        requestedType: type,
        purpose: purpose,
        flowType: "ISSUANCE", // 👈 This tells the backend to SKIP AI
      };

      // 🔥 CALL THE RENDER BACKEND
      const response = await fetch(`${BACKEND_URL}/createRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit request to backend");
      }

      alert("Certificate request sent to admin");
      navigate("/student/requests");
    } catch (err) {
      console.error("❌ Error:", err);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border max-w-xl border-[#D9F3E6]">
      <h2 className="text-2xl font-bold mb-4 text-[#1F3B2F]">
        Request New Certificate
      </h2>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-[#1F3B2F]">Certificate Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-[#1F3B2F] outline-none"
          >
            <option value="BONAFIDE">BONAFIDE</option>
            <option value="NOC">NOC</option>
            <option value="TRANSCRIPT">TRANSCRIPT</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-[#1F3B2F]">Purpose</label>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="border p-2 w-full rounded focus:ring-2 focus:ring-[#1F3B2F] outline-none"
            placeholder="Scholarship / Visa / Internship"
            required
          />
        </div>

        <button
          disabled={loading}
          className={`px-6 py-2 rounded font-bold text-white transition-all ${
            loading ? "bg-gray-400" : "bg-[#1F3B2F] hover:bg-[#163025]"
          }`}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}