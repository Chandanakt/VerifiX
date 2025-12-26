import { useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = "https://verifix-backend-sffh.onrender.com";

export default function NewRequest() {
  const [type, setType] = useState("BONAFIDE");
  const [purpose, setPurpose] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select a file");
    setLoading(true);

    try {
      const user = auth.currentUser;
      const requestData = {
        userId: user.uid,
        userEmail: user.email,
        requestedType: type,
        purpose,
        attachment: { name: file.name }
      };

      // 🔥 Triggers the Backend AI logic
      const response = await fetch(`${BACKEND_URL}/createRequest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (result.success) {
        alert("Submitted! AI Analysis complete.");
        navigate("/student/requests");
      }
    } catch (err) {
      alert("Submission failed. Ensure Render backend is awake.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Request</h2>
      <form onSubmit={submit} className="space-y-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border p-2 rounded">
          <option>BONAFIDE</option>
          <option>NOC</option>
          <option>TRANSCRIPT</option>
        </select>
        <input placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full border p-2 rounded" required />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" disabled={loading} className="bg-green-800 text-white p-2 rounded w-full">
          {loading ? "AI is Analyzing..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}