import { useState } from "react";
import { db, storage } from "../firebase";
import { useAuth } from "../auth/AuthContext.jsx";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function NewRequest() {
  const [type, setType] = useState("BONAFIDE");
  const [purpose, setPurpose] = useState("");
  const [file, setFile] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload required document.");

    const fileId = uuidv4();
    const storageRef = ref(storage, `uploads/${user.uid}/${fileId}-${file.name}`);
    await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(storageRef);

    await addDoc(collection(db, "requests"), {
      userId: user.uid,
      userEmail: user.email,
      type,
      purpose,
      status: "PENDING_AI_CHECK",
      attachment: { name: file.name, url: fileUrl },
      createdAt: serverTimestamp(),
    });

    navigate("/my-requests");
  };

  return (
    <div>
      <h2>Create Request</h2>
      <form onSubmit={submit}>
        <label>Document Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>BONAFIDE</option>
          <option>TRANSCRIPT</option>
          <option>NOC</option>
          <option>FEE_RECEIPT</option>
        </select>

        <label>Purpose</label>
        <input value={purpose} onChange={(e) => setPurpose(e.target.value)} required />

        <label>Upload File</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
