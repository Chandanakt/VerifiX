import React from "react";
import { auth, googleProvider } from "../firebase";
auth.signOut();
import {
  setPersistence,
  browserSessionPersistence,
  signInWithPopup,
} from "firebase/auth";

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      // 🔥 Forces login EVERY time (no automatic login on refresh)
      await setPersistence(auth, browserSessionPersistence);

      await signInWithPopup(auth, googleProvider);
      console.log("Google Login Successful");
    } catch (error) {
      console.error("Google Login Error: ", error);
      alert("Google login failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e9f7f1]">
      <div className="w-[1050px] h-[620px] bg-white shadow-2xl rounded-3xl overflow-hidden flex">

        {/* LEFT SIDE — LOGIN FORM */}
        <div className="w-1/2 bg-black text-white flex flex-col justify-center px-16">
          <h2 className="text-4xl font-bold mb-3">Welcome Back 👋</h2>
          <p className="text-gray-400 mb-10 text-sm">
            Sign in securely to access VerifiX document verification portal.
          </p>

          {/* GOOGLE LOGIN BUTTON */}
          <button
            onClick={handleGoogleLogin}
            className="bg-white text-black w-full py-4 rounded-full flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-100 transition mb-8 text-lg font-medium"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="h-6 w-6"
              alt="Google logo"
            />
            Sign in with Google
          </button>

          <div className="flex items-center gap-4 text-gray-400 text-sm mb-8">
            <div className="h-[1px] w-full bg-gray-700"></div>
            or sign in with Email
            <div className="h-[1px] w-full bg-gray-700"></div>
          </div>

          {/* EMAIL INPUT */}
          <input
            type="text"
            placeholder="Enter your email"
            className="w-full py-4 mb-5 px-5 bg-gray-800 rounded-full outline-none text-sm border border-gray-700"
          />

          {/* PASSWORD INPUT */}
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full py-4 mb-4 px-5 bg-gray-800 rounded-full outline-none text-sm border border-gray-700"
          />

          <div className="flex justify-between items-center text-xs text-gray-400 mb-8">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember
            </label>
            <button className="hover:text-white transition">
              Forgot password?
            </button>
          </div>

          {/* NORMAL LOGIN BUTTON (not functional) */}
          <button className="w-full py-4 bg-[#7ae0b3] text-black rounded-full font-semibold text-lg hover:bg-[#6ed5a8] transition">
            LOGIN
          </button>

          <p className="text-center text-xs mt-5">
            Not registered yet?{" "}
            <span className="text-[#7ae0b3] hover:underline cursor-pointer">
              Create an account
            </span>
          </p>
        </div>

        {/* RIGHT SIDE — VERIFIX THEME PANEL */}
        <div className="w-1/2 bg-gradient-to-b from-[#9be2b4] to-[#4ea577] text-black flex flex-col justify-center items-center px-10 text-center">
          <h1 className="text-4xl font-semibold mb-3 font-[cursive]">
            Welcome to VerifiX
          </h1>

          <p className="text-sm leading-relaxed mb-6 text-gray-900">
            Your trusted platform for secure and AI-powered document verification.
            Instantly submit, track, and get authenticated certificates —
            built for students, colleges, and administrators.
          </p>

          <img
            src="https://cdn-icons-png.flaticon.com/512/3209/3209265.png"
            alt="Document Verification"
            className="w-48 mt-4 drop-shadow-xl"
          />

          <p className="mt-6 text-xs text-gray-800 font-medium">
            Fast • Secure • Automated Verification
          </p>
        </div>
      </div>
    </div>
  );
}
