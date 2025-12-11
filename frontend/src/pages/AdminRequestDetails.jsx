import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const BASE = "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net";

export default function AdminRequestDetails() {
  const { id } = useParams();
  const [req, setReq] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    return onSnapshot(doc(db, "requests", id), (d) =>
      setReq({ id: d.id, ...d.data() })
    );
  }, [id]);

  const call = async (name) => {
    await fetch(`${BASE}/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: id }),
    });
  };

  if (!req) return <div>Loading...</div>;

  return (
    <div>
      <h2>Request Details</h2>
      <p>User: {req.userEmail}</p>
      <p>Type: {req.type}</p>
      <p>Status: {req.status}</p>

      <h3>AI Risk</h3>
      {req.aiRisk ? (
        <>
          <p>{req.aiRisk.score} ({req.aiRisk.level})</p>
          <ul>
            {req.aiRisk.reasons?.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </>
      ) : (
        <p>No analysis</p>
      )}

      <button onClick={() => call("approveRequest")}>Approve</button>
      <button onClick={() => call("rejectRequest")}>Reject</button>
      <button onClick={() => nav(-1)}>Back</button>
    </div>
  );
}
