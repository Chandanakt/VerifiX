import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Link } from "react-router-dom";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", auth.currentUser.uid),
      where("status", "==", "APPROVED")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setCertificates(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((r) => r.generatedCertificate?.downloadUrl)
      );
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading certificates...</div>;
  }

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
      <h2 className="text-xl font-bold mb-6">🎓 My Certificates</h2>

      {certificates.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No certificates issued yet.
        </p>
      ) : (
        <div className="space-y-4">
          {certificates.map((c) => (
            <div
              key={c.id}
              className="bg-white p-4 rounded-xl border flex justify-between items-center"
            >
              {/* LEFT */}
              <div>
                <p className="font-semibold text-[#2D4C3B]">
                  {c.type} Certificate
                </p>
                <p className="text-sm text-gray-600">
                  Purpose: {c.purpose}
                </p>
              </div>

              {/* RIGHT */}
              <div className="text-right space-y-2">
                <a
                  href={c.generatedCertificate.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block px-2 py-1 bg-[#1F3B2F] text-white rounded-lg hover:bg-[#163025]"
          >
                  Download Certificate
                </a>

                {/* ✅ CORRECT VERIFY LINK */}
                <Link
                  to={`/verify?certId=${c.id}`}
                  className="inline-block px-2 py-1 bg-[#1F3B2F] text-white rounded-lg hover:bg-[#163025]"
          >
                   Verify Certificate
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
