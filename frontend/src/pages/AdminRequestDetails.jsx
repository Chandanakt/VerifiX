import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";

const BACKEND_URL = "https://verifix-backend-sffh.onrender.com";

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

      if (!res.ok) {
        const errorText = await res.text();
        alert(errorText);
        return;
      }

      alert("Action completed successfully!");
    } catch (err) {
      alert("Backend call failed. Check your Render logs.");
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

  if (!req) return <div className="p-10 text-center text-[#1F3B2F]">Loading request details...</div>;

  const isVerification = req.flowType === "VERIFICATION";
  const isIssuance = req.flowType === "ISSUANCE" || req.flowType === "REQUEST_NEW";
  
  const canAct = (isVerification && req.aiVerdict) || isIssuance;
  const isPending = req.status === "PENDING_ADMIN";
  const isApproved = req.status === "APPROVED";

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6] max-w-3xl mx-auto my-10">
      <h2 className="text-2xl font-bold mb-6 text-[#1F3B2F]">Request Management</h2>

      {/* BASIC INFO */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-lg border border-[#D9F3E6] text-sm">
        <p><strong>User Email:</strong> {req.userEmail}</p>
        <p><strong>Certificate:</strong> {req.requestedType}</p>
        <p><strong>Flow Type:</strong> 
          <span className={`ml-2 font-bold ${isVerification ? "text-orange-600" : "text-blue-600"}`}>
            {isVerification ? "DOCUMENT VERIFICATION" : "NEW ISSUANCE"}
          </span>
        </p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold uppercase ${
            isPending ? "bg-yellow-100 text-yellow-800" : 
            isApproved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {req.status}
          </span>
        </p>
      </div>

      {/* NEW: PURPOSE SECTION */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-[#D9F3E6]">
        <h3 className="font-semibold text-[#1F3B2F] mb-1">Purpose of Request:</h3>
        <p className="text-gray-700 italic">"{req.purpose || "No purpose provided"}"</p>
      </div>

      {/* AI ANALYSIS SECTION */}
      {isVerification && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-[#1F3B2F]">AI Trust Analysis (Gemini)</h3>
          {req.aiVerdict ? (
            <div className="bg-white p-4 rounded border-l-4 border-green-500 text-sm shadow-sm">
              <p><strong>Verdict:</strong> {req.aiVerdict}</p>
              <p><strong>Confidence:</strong> {req.aiConfidence}%</p>
              <ul className="list-disc ml-5 mt-2 text-gray-600">
                {req.aiReasons?.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800 animate-pulse">
              ⏳ AI analysis is still processing the uploaded file...
            </div>
          )}
        </div>
      )}

      {/* DISPLAY GENERATED CERTIFICATE LINK IF APPROVED */}
      {isApproved && req.generatedCertificate?.downloadUrl && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-800 font-semibold mb-2">✅ Certificate Issued Successfully</p>
          <a 
            href={req.generatedCertificate.downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline font-medium"
          >
            View PDF in Supabase Storage
          </a>
        </div>
      )}

      {/* ADMIN ACTIONS */}
      {isPending && (
        <div className="flex gap-4 mb-8">
          <button
            disabled={!canAct || loading}
            onClick={() => callBackend("approveRequest")}
            className={`flex-1 py-3 rounded-lg font-bold text-white transition-all
              ${canAct ? "bg-green-600 hover:bg-green-700 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}
          >
            {loading ? "Processing..." : "Approve & Issue Certificate"}
          </button>

          <button
            disabled={!canAct || loading}
            onClick={() => callBackend("rejectRequest")}
            className={`px-8 py-3 rounded-lg font-bold text-white transition-all
              ${canAct ? "bg-red-500 hover:bg-red-600 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}
          >
            Reject
          </button>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="border-t border-[#D9F3E6] pt-6 flex justify-between">
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#1F3B2F] text-white rounded-lg hover:bg-black transition-colors">
          ← Back
        </button>
        <button onClick={handleDelete} className="px-6 py-2 bg-[#1F3B2F] text-white rounded-lg hover:bg-red transition-colors">
          Delete Permanently
        </button>
      </div>
    </div>
  );
}