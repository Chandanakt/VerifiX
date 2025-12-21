import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

// 🔁 REPLACE with your real Cloud Functions base URL
const BASE = "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net";

export default function AdminRequestDetails() {
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    return onSnapshot(doc(db, "requests", id), (snap) => {
      if (snap.exists()) {
        setReq({ id: snap.id, ...snap.data() });
      }
    });
  }, [id]);

  const callFunction = async (name) => {
    await fetch(`${BASE}/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });
  };

  if (!req) return <div>Loading request...</div>;

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">

      <h2 className="text-2xl font-bold mb-4 text-[#1F3B2F]">
        Request Details
      </h2>

      <div className="space-y-2 mb-6">
        <p><strong>User:</strong> {req.userEmail}</p>
        <p><strong>Document Type:</strong> {req.type}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={`px-3 py-1 rounded text-sm font-semibold ${
            req.status === "APPROVED"
              ? "bg-green-100 text-green-800"
              : req.status === "REJECTED"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {req.status.replaceAll("_", " ")}
          </span>
        </p>
      </div>

      {/* 🤖 AI ANALYSIS */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">AI Analysis (Gemini)</h3>

        {req.aiVerdict ? (
          <div className="bg-white p-4 rounded border">
            <p>
              <strong>Verdict:</strong> {req.aiVerdict}
            </p>
            <p>
              <strong>Confidence:</strong> {req.aiConfidence}%
            </p>
            <ul className="list-disc ml-5 mt-2 text-sm text-gray-600">
              {req.aiReasons?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">
            AI analysis pending or failed.
          </p>
        )}
      </div>

      {/* 🎯 ACTIONS */}
      {req.status === "PENDING_ADMIN_REVIEW" && (
        <div className="flex gap-4">
          <button
            onClick={() => callFunction("approveRequest")}
            className="px-6 py-2 bg-green-600 text-white rounded"
          >
            Approve
          </button>

          <button
            onClick={() => callFunction("rejectRequest")}
            className="px-6 py-2 bg-red-600 text-white rounded"
          >
            Reject
          </button>
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-sm text-gray-600 underline"
      >
        ← Back
      </button>
    </div>
  );
}
