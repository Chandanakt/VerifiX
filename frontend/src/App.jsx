import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import useUserRole from "./hooks/useUserRole";

import Login from "./pages/Login";
import Sidebar from "./pages/Sidebar";
import Topbar from "./pages/Topbar";
import StudentDashboard from "./pages/StudentDashboard";
import MyRequests from "./pages/MyRequests";
import NewRequest from "./pages/NewRequest";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequest from "./pages/AdminRequestDetails";

export default function App() {
  const [user, authLoading] = useAuthState(auth);
  const { role, loading } = useUserRole();

  if (authLoading || loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex bg-mintLight">
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 overflow-auto bg-mintLight min-h-screen">

          <Routes>
            {/* Student routes */}
            {role === "student" && (
              <>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/requests" element={<MyRequests />} />
                <Route path="/student/new" element={<NewRequest />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}

            {/* Admin routes */}
            {role === "admin" && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/request/:id" element={<AdminRequest />} />
                <Route path="*" element={<Navigate to="/admin" />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  );
}
