import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (s) => setList(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <table border="1">
        <tbody>
          {list.map((r) => (
            <tr key={r.id}>
              <td>{r.userEmail}</td>
              <td>{r.type}</td>
              <td>{r.status}</td>
              <td>{r.aiRisk ? `${r.aiRisk.score} (${r.aiRisk.level})` : "-"}</td>
              <td><Link to={`/admin/requests/${r.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
