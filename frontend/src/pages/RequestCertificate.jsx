import { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function RequestCertificate() {
  const [type, setType] = useState("BONAFIDE");
  const [purpose, setPurpose] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const user = auth.currentUser;

  const submit = async (e) => {
    e.preventDefault();
    if (!purpose) return alert("Purpose is required");

    try {
      setLoading(true);

      await addDoc(collection(db, "requests"), {
        flowType: "REQUEST_NEW",
        requestedType: type,
        purpose,

        userId: user.uid,
        userEmail: user.email,

        status: "PENDING_ADMIN",
        createdAt: serverTimestamp(),
      });

      alert("Certificate request sent to admin");
      navigate("/student/requests");
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5FFF9] p-6 rounded-2xl shadow border max-w-xl">
      <h2 className="text-2xl font-bold mb-4">
        Request New Certificate
      </h2>

      <form onSubmit={submit} className="space-y-4">

        <div>
          <label className="block mb-1">Certificate Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option>BONAFIDE</option>
            <option>NOC</option>
            <option>TRANSCRIPT</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Purpose</label>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Scholarship / Visa / Internship"
            required
          />
        </div>

        <button
          disabled={loading}
          className="px-6 py-2 bg-[#1F3B2F] text-white rounded"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>

      </form>
    </div>
  );
}
