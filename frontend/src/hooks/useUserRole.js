import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function useUserRole() {
  const [user, loadingAuth] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoadingRole(false);
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setRole(snap.data().role);
      } else {
        setRole("student"); // fallback safety
      }

      setLoadingRole(false);
    };

    fetchRole();
  }, [user]);

  return {
    user,
    role,
    loading: loadingAuth || loadingRole,
  };
}
