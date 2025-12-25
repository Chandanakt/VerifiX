import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "requests"), (snap) => {
      setRequests(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
  }, []);

  const total = requests.length;
  const approved = requests.filter(r => r.status === "APPROVED").length;
  const pending = requests.filter(
    r => r.status === "PENDING_ADMIN_REVIEW"
  ).length;

  const avgTrust =
    requests.filter(r => r.aiConfidence)
      .reduce((a, b) => a + b.aiConfidence, 0) /
    (requests.filter(r => r.aiConfidence).length || 1);

  const highRisk = requests.filter(
    r => r.aiVerdict === "FRAUDULENT"
  ).length;

  return (
    <div className="p-6 space-y-8 bg-[#EAF7EF] min-h-screen">

      <h1 className="text-3xl font-semibold text-[#1F3B2F]">
        Admin Dashboard
      </h1>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <Metric title="Total Requests" value={total} />
        <Metric title="Pending Review" value={pending} color="text-yellow-600" />
        <Metric title="Approved" value={approved} color="text-green-600" />
        <Metric
          title="Avg Trust Score"
          value={`${Math.round(avgTrust)}%`}
          color="text-blue-600"
        />
      </div>

      {/* HIGH RISK ALERT */}
      {highRisk > 0 && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-xl text-red-800">
          ⚠ {highRisk} document(s) flagged as <strong>FRAUDULENT</strong>
        </div>
      )}

      {/* REQUEST LIST */}
      <div className="bg-white p-6 rounded-2xl shadow border">
        <h2 className="text-xl font-semibold mb-4">
          Requests
        </h2>

        <div className="space-y-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="flex justify-between items-center border p-4 rounded-lg"
            >
              <div>
                <p className="font-semibold">{r.userEmail}</p>
                <p className="text-sm text-gray-600">
                  {r.type}
                </p>
                {r.aiConfidence && (
                  <p className="text-xs mt-1">
                    Trust: <strong>{r.aiConfidence}%</strong> (
                    {r.aiVerdict})
                  </p>
                )}
              </div>

              <Link
                to={`/admin/request/${r.id}`}
                className="px-6 py-2 bg-[#1F3B2F] text-white rounded cursor-pointer hover:bg-[#163025] transition"
            >
                Review →
              </Link>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function Metric({ title, value, color = "text-[#1F3B2F]" }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow border">
      <p className="text-sm text-gray-600">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}
