import React from "react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <input
        placeholder="Search documents..."
        className="px-4 py-2 border rounded-full w-80 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />

      <div className="flex items-center gap-3">
        <span className="text-gray-600">Chandana</span>
        <div className="w-10 h-10 bg-indigo-300 rounded-full flex items-center justify-center text-white font-bold">
          CK
        </div>
      </div>
    </header>
  );
}
