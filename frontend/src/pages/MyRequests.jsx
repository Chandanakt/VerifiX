import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function MyRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔐 WAIT until auth is ready
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setList(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading your requests...</div>;
  }

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
      <h2 className="text-xl font-bold mb-4">My Requests</h2>

      {list.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Type</th>
              <th>Status</th>
              <th>AI Risk</th>
              <th>Certificate</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td>{r.type || "-"}</td>
                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      r.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : r.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : r.status === "PENDING_ADMIN_REVIEW"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {r.status.replaceAll("_", " ")}
                  </span>
                </td>

                <td>{r.aiRisk?.score ?? "-"}</td>
                <td>
                  {r.generatedCertificate?.downloadUrl ? (
                    <a
                      href={r.generatedCertificate.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
