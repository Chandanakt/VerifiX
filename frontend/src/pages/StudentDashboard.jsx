import React from "react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div className="p-6 space-y-8">

      {/* ---- Hero Section ---- */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-semibold">Welcome Back 👋</h1>
        <p className="text-lg opacity-90 mt-1">
          Manage your certificate requests effortlessly with VerifiX.
        </p>

        <Link
          to="/new"
          className="mt-6 inline-block bg-white text-indigo-600 px-5 py-2 rounded-lg font-medium hover:bg-indigo-50 transition"
        >
          Create New Request →
        </Link>
      </div>

      {/* ---- Quick Stats ---- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-6 bg-white shadow rounded-xl border hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Total Requests</h2>
          <p className="text-4xl text-indigo-600 mt-2 font-bold">12</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl border hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Approved</h2>
          <p className="text-4xl text-green-600 mt-2 font-bold">8</p>
        </div>

        <div className="p-6 bg-white shadow rounded-xl border hover:shadow-lg transition">
          <h2 className="text-xl font-semibold">Pending</h2>
          <p className="text-4xl text-yellow-500 mt-2 font-bold">4</p>
        </div>

      </div>

      {/* ---- Quick Actions ---- */}
      <div className="bg-white p-6 shadow rounded-xl border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="flex flex-col gap-3">
          <Link
            to="/new"
            className="p-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
          >
            ➕ Create New Certificate Request
          </Link>

          <Link
            to="/requests"
            className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            📄 View My Requests
          </Link>
        </div>
      </div>

    </div>
  );
}
