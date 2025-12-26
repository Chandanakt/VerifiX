import { useState } from "react";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const BACKEND_URL =
  "https://verifix-backend-sffh.onrender.com";

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

      await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userEmail: user.email,

        requestedType: type,
        purpose,

        // 🔥 THIS IS CRITICAL
        attachment: {
          name: file.name,
          mimeType: file.type,
          size: file.size,
          uploaded: true, // UI hint only
        },

        // AI fields (will be filled by backend trigger)
        aiVerdict: null,
        aiConfidence: null,
        aiReasons: [],
        aiCompleted: false,

        status: "PENDING_ADMIN",

        createdAt: serverTimestamp(),
      });

      alert("Request submitted. AI analysis in progress.");
      navigate("/student/requests");

    } catch (err) {
      console.error("Request submission failed:", err);
      alert("Could not create request.");
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
            <option>BONAFIDE</option>
            <option>TRANSCRIPT</option>
            <option>NOC</option>
            <option>FEE_RECEIPT</option>
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
            Upload Document
          </label>

          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files[0])}
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
          className="px-6 py-2 bg-[#1F3B2F] text-white rounded hover:bg-[#163025]"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>

      </form>
    </div>
  );
}
