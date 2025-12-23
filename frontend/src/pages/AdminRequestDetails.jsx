import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

// 🔁 Replace AFTER deploying Cloud Run
const BACKEND_URL = "https://YOUR_CLOUD_RUN_URL";

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

  const callBackend = async (endpoint) => {
    try {
      await fetch(`${BACKEND_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });
    } catch (err) {
      console.error("Backend call failed:", err);
      alert("Action failed. Check backend.");
    }
  };

  if (!req) return <div>Loading request...</div>;

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">

      <h2 className="text-2xl font-bold mb-4 text-[#1F3B2F]">
        Request Details
      </h2>

      {/* 📄 BASIC INFO */}
      <div className="space-y-2 mb-6">
        <p><strong>User:</strong> {req.userEmail}</p>
        <p><strong>Document Type:</strong> {req.type}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-3 py-1 rounded text-sm font-semibold ${
              req.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : req.status === "REJECTED"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {req.status?.replaceAll("_", " ")}
          </span>
        </p>
      </div>

      {/* 🤖 AI TRUST REPORT */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          AI Trust Analysis (Gemini)
        </h3>

        {req.trustReport ? (
          <div className="bg-white p-4 rounded border">

            {/* Score */}
            <p className="mb-2">
              <strong>Trust Score:</strong>{" "}
              <span className="font-semibold">
                {req.trustReport.score} / 100
              </span>
            </p>

            {/* Verdict */}
            <p className="mb-2">
              <strong>Verdict:</strong>{" "}
              <span
                className={`font-semibold ${
                  req.trustReport.verdict === "AUTHENTIC"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {req.trustReport.verdict}
              </span>
            </p>

            {/* Signals */}
            <ul className="list-disc ml-5 text-sm text-gray-600">
              {req.trustReport.signals?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">
            AI analysis pending or unavailable.
          </p>
        )}
      </div>

      {/* 🎯 ADMIN ACTIONS */}
      {req.status === "PENDING_ADMIN" && (
        <div className="flex gap-4">
          <button
            onClick={() => callBackend("approve")}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve & Issue Certificate
          </button>

          <button
            onClick={() => callBackend("reject")}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
