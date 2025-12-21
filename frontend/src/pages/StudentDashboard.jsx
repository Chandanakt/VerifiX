import React from "react";
import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div className="p-6 space-y-8 bg-[#EAF7EF] min-h-screen">

      {/* ---- HERO SECTION ---- */}
      <div className="bg-[#F5FFF9] rounded-3xl p-10 shadow-md border border-[#D9F3E6]">
        <h1 className="text-3xl font-semibold text-[#2D4C3B]">Student Dashboard</h1>

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
        <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
          <h2 className="text-xl font-semibold text-[#2D4C3B]">Total Requests</h2>
          <p className="text-4xl font-bold text-[#2D4C3B] mt-3">12</p>
        </div>

        {/* Approved */}
        <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
          <h2 className="text-xl font-semibold text-[#2D4C3B]">Approved</h2>
          <p className="text-4xl font-bold text-green-600 mt-3">8</p>
        </div>

        {/* Pending */}
        <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
          <h2 className="text-xl font-semibold text-[#2D4C3B]">Pending</h2>
          <p className="text-4xl font-bold text-yellow-500 mt-3">4</p>
        </div>

      </div>

      {/* ---- QUICK ACTIONS ---- */}
      <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
        <h2 className="text-xl font-semibold text-[#2D4C3B] mb-4">Quick Actions</h2>

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
