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
  console.log("1. Submit button clicked!"); // CHECKPOINT 1

  if (!file) {
    console.log("Error: No file selected");
    return alert("Please select a document.");
  }
  
  setLoading(true);

  try {
    const user = auth.currentUser;
    console.log("2. Current User:", user?.email); // CHECKPOINT 2

    const requestData = {
      userId: user.uid,
      userEmail: user.email,
      requestedType: type,
      purpose: purpose,
      attachment: { name: file.name, type: file.type }
    };

    console.log("3. Sending fetch to:", `${BACKEND_URL}/createRequest`); // CHECKPOINT 3

    const response = await fetch(`${BACKEND_URL}/createRequest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    console.log("4. Response received:", response.status); // CHECKPOINT 4
    
    // ... rest of your code
  } catch (err) {
    console.error("5. Catch Block Error:", err); // CHECKPOINT 5
    alert("Submission failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border border-[#D9F3E6] max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Create Request</h2>
      <form onSubmit={submit} className="space-y-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border p-2 rounded">
          <option value="BONAFIDE">BONAFIDE</option>
          <option value="TRANSCRIPT">TRANSCRIPT</option>
          <option value="NOC">NOC</option>
        </select>
        <input placeholder="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} required className="w-full border p-2 rounded" />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full" />
        <button type="submit" disabled={loading} className="w-full py-2 bg-[#1F3B2F] text-white rounded">
          {loading ? "AI Analysis Triggering..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}