import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function VerifyCertificate() {
  const { certId } = useParams(); // /verify/:certId
  const [data, setData] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, "requests", certId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setInvalid(true);
        } else {
          const d = snap.data();

          // 🔐 Optional: restrict to owner
          if (auth.currentUser && d.userId !== auth.currentUser.uid) {
            setInvalid(true);
          } else if (d.status !== "APPROVED") {
            setInvalid(true);
          } else {
            setData(d);
          }
        }
      } catch {
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [certId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verifying certificate...
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            ❌ Invalid Certificate
          </h2>
          <p className="text-gray-600">
            This certificate is invalid, not approved, or not yours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAF7EF]">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-xl w-full">

        <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">
          ✔ Certificate Verified
        </h1>

        <div className="space-y-3 text-sm">
          <Info label="Student Email" value={data.userEmail} />
          <Info label="Certificate Type" value={data.type} />
          <Info label="Purpose" value={data.purpose} />
          <Info label="Issued By" value="College Authority" />
          <Info label="Verification Engine" value="VerifiX TrustAnchor" />
        </div>

        <div className="mt-6 flex justify-between text-sm">
          <a
            href={data.generatedCertificate.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="text-green-700 underline"
          >
            ⬇ Download Certificate
          </a>

          <Link to="/student" className="text-blue-600 underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-1">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
