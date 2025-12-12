import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-72 bg-white shadow-md min-h-screen p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
            V
          </div>

          <div>
            <div className="font-bold text-lg">VerifiX</div>
            <div className="text-xs text-gray-500">Document Trust</div>
          </div>
        </div>

        <nav className="space-y-2 text-gray-700">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg ${
                isActive ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/requests"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg ${
                isActive ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"
              }`
            }
          >
            My Requests
          </NavLink>

          <NavLink
            to="/new"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg ${
                isActive ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"
              }`
            }
          >
            Upload Document
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg mt-4 ${
                isActive ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100"
              }`
            }
          >
            Admin Panel
          </NavLink>
        </nav>
      </div>

      <div>
        <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100">
          Help & Support
        </button>

        <button className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-gray-100 mt-2">
          Logout
        </button>
      </div>
    </aside>
  );
}
