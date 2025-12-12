import { Routes, Route } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Sidebar from "./pages/Sidebar";
import Topbar from "./pages/Topbar";
import StudentDashboard from "./pages/StudentDashboard";
import MyRequests from "./pages/MyRequests";
import NewRequest from "./pages/NewRequest";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequest from "./pages/AdminRequestDetails";

export default function App() {
  const [user] = useAuthState(auth);

  // 🔥 If user is NOT logged in → Show Login Page
  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/requests" element={<MyRequests />} />
            <Route path="/new" element={<NewRequest />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/request/:id" element={<AdminRequest />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
