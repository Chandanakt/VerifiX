import express from "express";
import cors from "cors";
import admin from "firebase-admin";

import { analyzeDocument } from "./ai/forensics.js";
import { generateCertificate } from "./certificates/generateCertificate.js";

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * 🔍 Analyze uploaded document (AI Forensics)
 */
app.post("/analyze", async (req, res) => {
  const { requestId, type, purpose } = req.body;

  const result = await analyzeDocument(type, purpose);

  await db.collection("requests").doc(requestId).update({
    trustReport: result,
    status: "PENDING_ADMIN"
  });

  res.json({ success: true });
});

/**
 * ✅ Admin approves request → generate certificate
 */
app.post("/approve", async (req, res) => {
  const { requestId } = req.body;

  const snap = await db.collection("requests").doc(requestId).get();
  const data = snap.data();

  const cert = await generateCertificate(data, requestId);

  await snap.ref.update({
    status: "APPROVED",
    certificate: cert
  });

  res.json({ success: true });
});

/**
 * ❌ Reject
 */
app.post("/reject", async (req, res) => {
  await db.collection("requests").doc(req.body.requestId)
    .update({ status: "REJECTED" });

  res.json({ success: true });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () =>
  console.log("VerifiX backend running")
);
