import React from "react";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext.jsx";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

export default function MyRequests() {
  const { user } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "requests"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) =>
      setList(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [user.uid]);

  return (
    <div>
      <h2>My Requests</h2>

      <table border="1">
        <tbody>
          {list.map((r) => (
            <tr key={r.id}>
              <td>{r.type}</td>
              <td>{r.status}</td>
              <td>{r.aiRisk ? r.aiRisk.score : "-"}</td>
              <td>
                {r.generatedCertificate?.downloadUrl ? (
                  <a href={r.generatedCertificate.downloadUrl} target="_blank">
                    Download
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
