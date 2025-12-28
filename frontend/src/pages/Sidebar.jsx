import React from "react";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase";

export default function Sidebar({ role }) {
  return (
    <aside className="w-64 min-h-screen bg-[#F5FFF9] border-r border-[#D9F3E6] p-6 flex flex-col justify-between">

      {/* LOGO */}
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#1F3B2F] rounded-xl flex items-center justify-center text-white font-bold">
            V
          </div>
          <div>
            <div className="text-xl font-semibold text-[#2D4C3B]">VerifiX</div>
            <div className="text-sm text-[#3B5F4A] opacity-80">
              Document Trust
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="space-y-2 text-gray-700">

          {/* STUDENT LINKS */}
          {role === "student" && (
            <>
              <NavLink to="/student" end className={navStyle}>
                Dashboard
              </NavLink>

              <NavLink to="/student/requests" className={navStyle}>
                My Requests
              </NavLink>

              <NavLink to="/student/new" className={navStyle}>
                Upload Document
              </NavLink>

              
            </>
          )}

          {/* ADMIN LINKS */}
          {role === "admin" && (
            <>
              <NavLink to="/admin" className={navStyle}>
                Admin Dashboard
              </NavLink>
            </>
          )}

        </nav>
      </div>

      {/* FOOTER */}
      <div>
        <button
          onClick={() => auth.signOut()}
          className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-gray-100 mt-2"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

const navStyle = ({ isActive }) =>
  `block px-3 py-2 rounded-lg ${
    isActive
      ? "bg-[#D9F3E6] text-[#1F3B2F]"
      : "hover:bg-[#ECFDF6]"
  }`;
