import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBhAMsi4buthW7FvXTm03xHlHo3Obt0osA",
  authDomain: "verifix-be399.firebaseapp.com",
  projectId: "verifix-be399",
  storageBucket: "verifix-be399.firebasestorage.app",
  messagingSenderId: "364363170894",
  appId: "1:364363170894:web:014583e456a3387c22ef1f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
