import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function StudentDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "requests"),
      where("userId", "==", auth.currentUser.uid)
    );

    return onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* 📊 Stats */
  const total = requests.length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const pending = requests.filter(
    (r) =>
      r.status === "PENDING_AI_CHECK" ||
      r.status === "PENDING_ADMIN_REVIEW"
  ).length;

  /* 🎓 Issued Certificates */
  const certificates = requests.filter(
    (r) => r.status === "APPROVED" && r.generatedCertificate
  );

  /* 🗑️ Delete handler (ONLY before admin decision) */
  const deleteRequest = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this request? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "requests", id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete request");
    }
  };

  return (
    <div className="p-6 space-y-8 bg-[#EAF7EF] min-h-screen">

      {/* ---- HERO ---- */}
      <div className="bg-[#F5FFF9] rounded-3xl p-10 shadow-md border border-[#D9F3E6]">
        <h1 className="text-3xl font-semibold text-[#2D4C3B]">
          Student Dashboard
        </h1>
        <p className="text-[#3B5F4A] mt-2 text-lg opacity-80">
          Verify documents or request official certificates from your college.
        </p>
      </div>

      {/* ---- TWO MAIN FLOWS ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* FLOW A */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-2">
            🔍 Verify Existing Document
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload an existing document to detect forgery using AI forensics.
          </p>
          <Link
            to="/student/certificates"
            className="inline-block px-5 py-3 bg-[#1F3B2F] text-white rounded-lg hover:bg-[#163025]"
          >
            Verify Document →
          </Link>
        </div>

        {/* FLOW B */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-2">
            🏛️ Request New Certificate
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Request a bonafide, NOC, or transcript issued by the college.
          </p>
          <Link
            to="/student/request-certificate"
            className="inline-block px-5 py-3 bg-[#4ea577] text-white rounded-lg hover:bg-[#3f8f64]"
          >
            Request Certificate →
          </Link>
        </div>

      </div>

      {/* ---- STATS ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Requests" value={total} color="text-[#2D4C3B]" />
        <StatCard title="Approved" value={approved} color="text-green-600" />
        <StatCard title="Pending" value={pending} color="text-yellow-500" />
      </div>
    </div>
  );
}

/* 🔹 Reusable Stat Card */
function StatCard({ title, value, color }) {
  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
      <h2 className="text-xl font-semibold text-[#2D4C3B]">
        {title}
      </h2>
      <p className={`text-4xl font-bold mt-3 ${color}`}>
        {value}
      </p>
    </div>
  );
}
