import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const BACKEND_URL = "https://verifix-backend-sffh.onrender.com";

export default function AdminRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "requests", id), (snap) => {
      if (snap.exists()) setReq({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [id]);

  const approve = async () => {
    setLoading(true);
    const res = await fetch(`${BACKEND_URL}/approveRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });
    const result = await res.json();
    if (result.success) {
      alert("Certificate Issued!");
      window.open(result.downloadUrl, "_blank");
    }
    setLoading(false);
  };

  if (!req) return <div>Loading...</div>;

  const aiReady = req.aiVerdict && req.aiConfidence;

  return (
    <div className="p-6 border rounded-xl bg-white">
      <h2 className="text-xl font-bold mb-4">Review Request</h2>
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h3 className="font-bold mb-2">AI Trust Analysis:</h3>
        {aiReady ? (
          <div>
            <p className="text-green-700 font-bold">Verdict: {req.aiVerdict}</p>
            <p>Confidence: {req.aiConfidence}%</p>
          </div>
        ) : (
          <p className="text-yellow-600">⏳ AI analysis is still running...</p>
        )}
      </div>
      <button disabled={!aiReady || loading} onClick={approve} className="bg-green-600 text-white px-6 py-2 rounded disabled:bg-gray-300">
        Approve & Issue Certificate
      </button>
    </div>
  );
}