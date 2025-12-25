import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";

const BACKEND_URL =
  "http://127.0.0.1:5001/verifix-be399/us-central1";

export default function AdminRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "requests", id), (snap) => {
      if (snap.exists()) {
        setReq({ id: snap.id, ...snap.data() });
      }
    });
    return () => unsub();
  }, [id]);

  const callBackend = async (endpoint) => {
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id }),
      });

      const text = await res.text();

      if (!res.ok) {
        alert(text);
        return;
      }

      alert("Action completed successfully");
    } catch (err) {
      alert("Backend call failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this request permanently?")) return;

    try {
      setLoading(true);
      await deleteDoc(doc(db, "requests", id));
      alert("Request deleted");
      navigate("/admin");
    } catch {
      alert("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (!req) return <div>Loading...</div>;

  const aiReady = req.aiVerdict && req.aiConfidence;
  const isPending = req.status === "PENDING_ADMIN";

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6] max-w-3xl">

      <h2 className="text-2xl font-bold mb-6 text-[#1F3B2F]">
        Request Details
      </h2>

      {/* BASIC INFO */}
      <div className="space-y-2 mb-6 text-sm">
        <p><strong>User:</strong> {req.userEmail}</p>
        <p><strong>Document Type:</strong> {req.requestedType || req.type}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">
            {req.status}
          </span>
        </p>
      </div>

      {/* AI ANALYSIS */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">
          AI Trust Analysis (Gemini)
        </h3>

        {aiReady ? (
          <div className="bg-white p-4 rounded border text-sm">
            <p><strong>Verdict:</strong> {req.aiVerdict}</p>
            <p><strong>Confidence:</strong> {req.aiConfidence}%</p>

            <ul className="list-disc ml-5 text-gray-600">
              {req.aiReasons?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800">
            ⏳ AI analysis is still running.  
            Approval actions will be enabled once analysis is complete.
          </div>
        )}
      </div>

      {/* ADMIN ACTIONS */}
      {isPending && (
        <div className="flex gap-4 mb-6">
          <button
            disabled={!aiReady || loading}
            onClick={() => callBackend("approveRequest")}
            className={`px-6 py-2 rounded text-white
              ${aiReady ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Approve & Issue Certificate
          </button>

          <button
            disabled={!aiReady || loading}
            onClick={() => callBackend("rejectRequest")}
            className={`px-6 py-2 rounded text-white
              ${aiReady ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"}`}
          >
            Reject
          </button>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="border-t pt-4 flex justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#1F3B2F] text-white rounded"
        >
          ← Back
        </button>

        <button
          onClick={handleDelete}
          className="px-6 py-2 bg-black text-white rounded"
        >
          Delete Request
        </button>
      </div>
    </div>
  );
}
