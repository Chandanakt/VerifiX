import React from "react";
import { auth } from "../firebase";

export default function Topbar() {
  const user = auth.currentUser;

  return (
    <div className="w-full bg-[#F5FFF9] border-b border-[#D9F3E6] px-8 py-4 flex justify-between items-center shadow-sm">

      <input
        type="text"
        placeholder="Search documents..."
        className="w-96 px-4 py-2 bg-white border border-[#D9F3E6] rounded-xl text-[#2D4C3B] outline-none focus:ring-2 focus:ring-[#9BE2B4]"
      />

      <div className="flex items-center gap-3">
        <span className="text-[#2D4C3B] font-medium">{user?.displayName}</span>

        <div className="w-10 h-10 bg-[#D0F0DF] rounded-full flex items-center justify-center text-[#1F3B2F] font-semibold">
          {user?.displayName?.[0]}
        </div>
      </div>
    </div>
  );
}
