import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import NewRequest from "./pages/NewRequest.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminRequestDetails from "./pages/AdminRequestDetails.jsx";

function PrivateRoute({ children, adminOnly = false }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div>
      <header style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/">VerifiX</Link>
        {user && (
          <span style={{ marginLeft: "20px" }}>
            {user.email} {isAdmin && "(Admin)"}
            <button style={{ marginLeft: "10px" }} onClick={logout}>Logout</button>
          </span>
        )}
      </header>

      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route path="/" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/new-request" element={<PrivateRoute><NewRequest /></PrivateRoute>} />
          <Route path="/my-requests" element={<PrivateRoute><MyRequests /></PrivateRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/requests/:id" element={<PrivateRoute adminOnly><AdminRequestDetails /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
