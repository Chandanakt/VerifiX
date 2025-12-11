import { Link } from "react-router-dom";

export default function StudentDashboard() {
  return (
    <div>
      <h2>Student Dashboard</h2>
      <ul>
        <li><Link to="/new-request">Create New Request</Link></li>
        <li><Link to="/my-requests">My Requests</Link></li>
      </ul>
    </div>
  );
}
