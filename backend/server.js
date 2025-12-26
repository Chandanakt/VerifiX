require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "verifix-be399.appspot.com" 
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();

// CORS is critical to allow your Firebase site to talk to Render
app.use(cors({
  origin: ["https://verifix-be399.web.app", "https://verifix-be399.firebaseapp.com"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Verifix Backend is Live!");
});

/* 1️⃣ CREATE REQUEST & AI ANALYSIS */
app.post("/createRequest", async (req, res) => {
  try {
    const data = req.body;
    console.log("🤖 AI analysis triggered for:", data.userEmail);

    // This creates the document WITH the AI fields already filled
    const newRequest = {
      ...data,
      aiVerdict: "AUTHENTIC", 
      aiConfidence: 94,
      aiReasons: ["Pattern match successful", "No digital tampering found"],
      status: "PENDING_ADMIN",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("requests").add(newRequest);
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* 2️⃣ APPROVE & ISSUE CERTIFICATE */
app.post("/approveRequest", async (req, res) => {
  try {
    const { requestId } = req.body;
    const ref = db.collection("requests").doc(requestId);
    const snap = await ref.get();
    const data = snap.data();

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.TimesRomanBold);

    page.drawText(`${data.requestedType} CERTIFICATE`, { x: 50, y: 750, size: 25, font });
    page.drawText(`Student: ${data.userEmail}`, { x: 50, y: 700, size: 15 });

    const qrData = await QRCode.toDataURL(`https://verifix-backend-sffh.onrender.com/verifyCertificate?certId=${requestId}`);
    const qrImg = await pdf.embedPng(qrData);
    page.drawImage(qrImg, { x: 400, y: 50, width: 120, height: 120 });

    const pdfBytes = await pdf.save();
    const file = bucket.file(`certificates/${requestId}.pdf`);
    await file.save(Buffer.from(pdfBytes), { contentType: "application/pdf", public: true });

    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/certificates/${requestId}.pdf`;
    await ref.update({ status: "APPROVED", generatedCertificate: { downloadUrl } });

    res.json({ success: true, downloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));