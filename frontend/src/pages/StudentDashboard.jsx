import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot
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
      setRequests(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
  }, []);

  // 📊 Stats
  const total = requests.length;
  const approved = requests.filter(
    (r) => r.status === "APPROVED"
  ).length;
  const pending = requests.filter(
    (r) =>
      r.status === "PENDING_FORENSICS" ||
      r.status === "PENDING_ADMIN"
  ).length;

  return (
    <div className="p-6 space-y-8 bg-[#EAF7EF] min-h-screen">

      {/* ---- HERO SECTION ---- */}
      <div className="bg-[#F5FFF9] rounded-3xl p-10 shadow-md border border-[#D9F3E6]">
        <h1 className="text-3xl font-semibold text-[#2D4C3B]">
          Student Dashboard
        </h1>

        <p className="text-[#3B5F4A] mt-2 text-lg opacity-80">
          Manage your certificate requests effortlessly with VerifiX.
        </p>

        <Link
          to="/student/new"
          className="mt-6 inline-block bg-[#1F3B2F] text-white px-6 py-3 rounded-xl font-medium shadow hover:bg-[#173026] transition"
        >
          Create New Request →
        </Link>
      </div>

      {/* ---- QUICK STATS ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Total Requests */}
        <StatCard
          title="Total Requests"
          value={total}
          color="text-[#2D4C3B]"
        />

        {/* Approved */}
        <StatCard
          title="Approved"
          value={approved}
          color="text-green-600"
        />

        {/* Pending */}
        <StatCard
          title="Pending"
          value={pending}
          color="text-yellow-500"
        />
      </div>

      {/* ---- RECENT REQUESTS ---- */}
      <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
        <h2 className="text-xl font-semibold text-[#2D4C3B] mb-4">
          Recent Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No requests submitted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="p-4 bg-white rounded-xl border flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-[#2D4C3B]">
                    {r.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    {r.purpose}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      r.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : r.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {r.status.replaceAll("_", " ")}
                  </span>

                  {r.status === "APPROVED" && (
                    <p className="text-xs text-green-700 mt-1">
                      Certificate Available ✔
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---- QUICK ACTIONS ---- */}
      <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
        <h2 className="text-xl font-semibold text-[#2D4C3B] mb-4">
          Quick Actions
        </h2>

        <div className="flex flex-col gap-4">

          <Link
            to="/student/new"
            className="p-4 bg-[#E1F7EC] text-[#1F3B2F] rounded-xl hover:bg-[#D0F0DF] transition shadow-sm"
          >
            ➕ Create New Certificate Request
          </Link>

          <Link
            to="/student/requests"
            className="p-4 bg-[#EEF5F0] text-[#2D4C3B] rounded-xl hover:bg-[#E1ECE5] transition shadow-sm"
          >
            📄 View My Requests
          </Link>

        </div>
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
