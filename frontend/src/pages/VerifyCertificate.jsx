import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function VerifyCertificate() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const snap = await getDoc(doc(db, "requests", id));

        if (snap.exists() && snap.data().status === "APPROVED") {
          setData(snap.data());
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Verification failed:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF7EF]">
        <p className="text-lg text-gray-600">
          Verifying certificate…
        </p>
      </div>
    );
  }

  /* ❌ INVALID / UNAPPROVED */
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAF7EF] p-6">
        <div className="bg-[#F5FFF9] p-8 rounded-2xl shadow border border-[#D9F3E6] max-w-md text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-3">
            ❌ Invalid Certificate
          </h2>
          <p className="text-gray-600">
            This certificate is either invalid, revoked, or not approved.
          </p>
        </div>
      </div>
    );
  }

  /* ✅ VALID CERTIFICATE */
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAF7EF] p-6">
      <div className="bg-[#F5FFF9] p-8 rounded-3xl shadow border border-[#D9F3E6] max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-[#1F3B2F]">
            ✅ Certificate Verified
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Verified securely via VerifiX
          </p>
        </div>

        {/* Certificate Details */}
        <div className="space-y-4 text-[#2D4C3B]">

          <Detail label="Student Email" value={data.userEmail} />
          <Detail label="Document Type" value={data.type} />
          <Detail label="Purpose" value={data.purpose} />

          {data.certificate?.issuedAt && (
            <Detail
              label="Issued On"
              value={new Date(
                data.certificate.issuedAt
              ).toLocaleString()}
            />
          )}

          {/* Trust Score */}
          {data.trustReport && (
            <div className="mt-4 p-4 bg-white rounded-xl border">
              <p className="text-sm font-medium mb-1">
                AI Trust Score
              </p>
              <div className="flex items-center gap-3">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      data.trustReport.score >= 75
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${data.trustReport.score}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">
                  {data.trustReport.score}/100
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          This certificate was issued digitally by VerifiX  
          <br />
          Tamper-resistant • QR-verified • Secure
        </div>

      </div>
    </div>
  );
}

/* 🔹 Reusable detail row */
function Detail({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
