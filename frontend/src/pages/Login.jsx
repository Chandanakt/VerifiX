import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useAuth } from "../auth/AuthContext.jsx";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;

  const handleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  return (
    <div>
      <h2>Login to VerifiX</h2>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
}
