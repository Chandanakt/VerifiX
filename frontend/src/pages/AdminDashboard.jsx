import React from "react";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
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
        <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
          <h2 className="text-lg font-medium text-gray-600">
            Total Requests
          </h2>
          <p className="text-4xl font-bold text-[#4ea577] mt-2">24</p>
        </div>

        <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
          <h2 className="text-lg font-medium text-gray-600">
            Pending Approval
          </h2>
          <p className="text-4xl font-bold text-yellow-500 mt-2">6</p>
        </div>

        <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6]">
          <h2 className="text-lg font-medium text-gray-600">
            Approved
          </h2>
          <p className="text-4xl font-bold text-green-600 mt-2">18</p>
        </div>
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
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-3">Chandana K T</td>
              <td className="py-3">Bonafide Certificate</td>
              <td className="py-3 text-yellow-500 font-medium">
                Pending
              </td>
              <td className="py-3">
                <button className="text-[#4ea577] hover:underline">
                  Review
                </button>
              </td>
            </tr>

            <tr>
              <td className="py-3">Rahul Sharma</td>
              <td className="py-3">Internship Certificate</td>
              <td className="py-3 text-green-600 font-medium">
                Approved
              </td>
              <td className="py-3">
                <button className="text-gray-400 cursor-not-allowed">
                  Done
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}
