import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  doc
} from "firebase/firestore";
import { auth, db } from "../firebase";

export default function MyRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      setList(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
      setLoading(false);
    });
  }, []);

  /* 🗑 DELETE REQUEST (only before admin decision) */
  const handleDelete = async (id) => {
    const ok = window.confirm(
      "Are you sure you want to delete this request?\nThis action cannot be undone."
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "requests", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete request");
    }
  };

  if (loading) {
    return <div className="text-gray-600">No requests found.</div>;
  }

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
      <h2 className="text-xl font-bold mb-6">My Requests</h2>

      {list.length === 0 ? (
        <p className="text-gray-500">No requests found.</p>
      ) : (
        <table className="w-full border-separate border-spacing-y-4 text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="px-4">Type</th>
              <th className="px-4">Purpose</th>
              <th className="px-4">Status</th>
              <th className="px-4">AI Risk</th>
              <th className="px-4">Certificate</th>
              <th className="px-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {list.map((r) => {
              const canDelete =
                r.status === "PENDING_AI_CHECK" ||
                r.status === "PENDING_FORENSICS" ||
                r.status === "PENDING_ADMIN";

              return (
                <tr
                  key={r.id}
                  className="bg-white rounded-xl shadow-sm"
                >
                  {/* ✅ FIXED TYPE COLUMN */}
                  <td className="px-4 py-4 font-semibold">
                    {r.requestedType || r.type || "-"}
                  </td>

                  <td className="px-4 py-4">
                    {r.purpose || "Document Verification"}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        r.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : r.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {r.status.replaceAll("_", " ")}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    {r.aiConfidence ? `${r.aiConfidence}%` : "-"}
                  </td>

                  <td className="px-4 py-4">
                    {r.generatedCertificate?.downloadUrl ? (
                      <a
                        href={r.generatedCertificate.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-700 underline"
                      >
                        Download
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {canDelete ? (
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="px-5 py-2 bg-[#1F3B2F] text-white rounded hover:bg-[#163025] transition"
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="px-5 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed">
                        Locked
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
