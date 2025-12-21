import React from "react";
import loginPic from "./login_pic.jpg";
import { auth, googleProvider, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
auth.signOut();
import {
  setPersistence,
  browserSessionPersistence,
  signInWithPopup,
} from "firebase/auth";

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);

      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "student",
          createdAt: new Date(),
        });
      }

      console.log("Login success");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#e9f7f1" }}
    >
      <div className="w-[1100px] h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">

        {/* ================= LEFT — AUTHENTICATE PANEL ================= */}
        <div className="w-1/2 bg-[#0b0f14] text-white flex flex-col items-center justify-center relative overflow-hidden">

          {/* Background glow */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,#1f3b4d,transparent_40%),radial-gradient(circle_at_bottom_right,#0fb9b1,transparent_40%)]"></div>

          <div className="z-10 flex flex-col items-center w-full px-16">

            <h1 className="text-4xl font-extrabold tracking-widest mb-10">
              AUTHENTICATE
            </h1>

            {/* Google Button (optional, still kept) */}
            <button
              onClick={handleGoogleLogin}
              className="bg-white text-black w-full max-w-md py-4 rounded-full flex items-center justify-center gap-3 shadow-lg text-lg font-medium hover:scale-[1.02] transition"
            >
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                className="h-6 w-6"
                alt="Google"
              />
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8 text-sm text-gray-400">
              <div className="h-[1px] w-80 bg-teal-400"></div>
            </div>

            {/* ================= CLICKABLE FINGERPRINT ================= */}
            <div
              onClick={handleGoogleLogin}
              className="relative mt-6 mb-6 cursor-pointer group"
            >
              <div
                className="w-44 h-44 rounded-full border-2 border-teal-400
                           flex items-center justify-center
                           shadow-[0_0_40px_#2dd4bf]
                           transition
                           group-hover:shadow-[0_0_70px_#2dd4bf]
                           animate-pulse"
              >
                <img
                  src="https://cdn2.vectorstock.com/i/1000x1000/14/26/technology-digital-cyber-security-lock-circle-vector-16271426.jpg"
                  className="w-28 opacity-90"
                  alt="Fingerprint Login"
                />
              </div>

              {/* small security icons */}
              <span className="absolute top-3 left-5 text-teal-400">🔒</span>
              <span className="absolute bottom-4 right-6 text-teal-400">🛡️</span>
            </div>

            <p className="text-sm text-gray-400">
              Sign in with <span className="text-teal-400">Google</span>
            </p>
          </div>
        </div>

        {/* ================= RIGHT — VERIFIX PANEL ================= */}
        <div className="w-1/2 bg-gradient-to-b from-[#c8f3d4] to-[#8ad8a6] flex flex-col justify-center items-center px-12 text-center">

          <h1 className="text-4xl font-extrabold mb-4 text-[#0b3d2e]">
            Welcome to VerifiX
          </h1>

          <p className="text-base leading-relaxed mb-8 text-[#0f2e24] max-w-md">
            Your trusted platform for secure and AI-powered document verification.
            Instantly submit, track, and get authenticated certificates —
            built for students, colleges, and administrators.
          </p>

          <img
            src={loginPic}
            alt="Document Verification"
            className="w-[340px] rounded-xl shadow-xl mb-6"
          />

          <p className="text-sm text-[#0f2e24] font-semibold tracking-wide">
            Fast • Secure • Automated Verification
          </p>
        </div>

      </div>
    </div>
  );
}
