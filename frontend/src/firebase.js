import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBhAMsi4buthW7FvXTm03xHlHo3Obt0osA",
  authDomain: "verifix-be399.firebaseapp.com",
  projectId: "verifix-be399",
  storageBucket: "verifix-be399.firebasestorage.app",
  messagingSenderId: "364363170894",
  appId: "1:364363170894:web:014583e456a3387c22ef1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Google Provider (THIS WAS MISSING)
export const googleProvider = new GoogleAuthProvider();
import { connectFirestoreEmulator } from "firebase/firestore";

if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
