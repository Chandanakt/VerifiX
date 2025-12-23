import { useState } from "react";
import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://YOUR_CLOUD_RUN_URL"; // 🔁 replace after deploy

export default function NewRequest() {
  const [type, setType] = useState("BONAFIDE");
  const [purpose, setPurpose] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 🔐 Ensure auth is ready
  if (!auth.currentUser) {
    return <div>Loading user...</div>;
  }

  const submit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a document.");
      return;
    }

    // ✅ File validation (engineering polish)
    if (
      !file.type.includes("pdf") &&
      !file.type.includes("image")
    ) {
      alert("Only PDF or image files are allowed.");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      // 🔥 STEP 1: Create Firestore request (NO FILE STORAGE)
      const docRef = await addDoc(collection(db, "requests"), {
        userId: user.uid,
        userEmail: user.email,
        type,
        purpose,

        status: "PENDING_FORENSICS",

        trustReport: null,

        attachment: {
          name: file.name,
          // 🔐 No real upload in hackathon demo
          url: `local-demo://${file.name}`,
        },

        createdAt: serverTimestamp(),
      });

      // 🔥 STEP 2: Trigger AI forensics (Cloud Run)
      await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: docRef.id,
          type,
          purpose,
          fileName: file.name,
        }),
      });

      alert("Request submitted. AI analysis in progress.");
      navigate("/student/requests");

    } catch (err) {
      console.error("Request submission failed:", err);
      alert("Failed to submit request.");
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

        {/* Upload File (Styled Button) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Upload Document
          </label>

          <div className="flex items-center gap-4">
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />

            <label
              htmlFor="fileUpload"
              className="px-6 py-2 bg-[#1F3B2F] text-white rounded cursor-pointer hover:bg-[#163025] transition"
            >
              Choose File
            </label>

            <span className="text-sm text-gray-600">
              {file ? file.name : "No file chosen"}
            </span>
          </div>
        </div>

        {/* Submit */}
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
