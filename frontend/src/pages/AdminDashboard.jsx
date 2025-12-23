import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy
} from "firebase/firestore";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      setRequests(snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })));
    });
  }, []);

  // 📊 Stats
  const total = requests.length;
  const pending = requests.filter(
    r => r.status === "PENDING_ADMIN"
  ).length;
  const approved = requests.filter(
    r => r.status === "APPROVED"
  ).length;

  return (
    <div className="p-6 space-y-8 bg-[#EAF7EF] min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#1F3B2F]">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and verify student document requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Requests"
          value={total}
          color="text-[#4ea577]"
        />
        <StatCard
          title="Pending Approval"
          value={pending}
          color="text-yellow-500"
        />
        <StatCard
          title="Approved"
          value={approved}
          color="text-green-600"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
        <h2 className="text-xl font-semibold mb-4">
          Recent Requests
        </h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-3">Student</th>
              <th className="pb-3">Document</th>
              <th className="pb-3">Trust</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="py-3">{r.userEmail}</td>
                <td className="py-3">{r.type}</td>

                {/* Trust Score */}
                <td className="py-3">
                  {r.trustReport ? (
                    <span className={`font-semibold ${
                      r.trustReport.score >= 75
                        ? "text-green-600"
                        : "text-red-600"
                    }`}>
                      {r.trustReport.score}/100
                    </span>
                  ) : (
                    <span className="text-gray-400">
                      Analyzing…
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    r.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : r.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {r.status.replaceAll("_", " ")}
                  </span>
                </td>

                {/* Action */}
                <td className="py-3">
                  {r.status === "PENDING_ADMIN" ? (
                    <Link
                      to={`/admin/request/${r.id}`}
                      className="text-[#4ea577] hover:underline"
                    >
                      Review
                    </Link>
                  ) : (
                    <span className="text-gray-400">
                      Done
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {requests.length === 0 && (
          <p className="text-gray-500 text-sm mt-4">
            No requests found.
          </p>
        )}
      </div>

    </div>
  );
}

/* 🔹 Reusable Stat Card */
function StatCard({ title, value, color }) {
  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
      <h2 className="text-lg font-medium text-gray-600">
        {title}
      </h2>
      <p className={`text-4xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  );
}
