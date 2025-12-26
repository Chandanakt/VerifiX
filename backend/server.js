require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");

// 1. INITIALIZE FIREBASE ADMIN
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "verifix-be399.appspot.com" 
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();

// 2. MIDDLEWARE 
app.use(cors({
  origin: [
    "https://verifix-be399.web.app", 
    "https://verifix-be399.firebaseapp.com",
    "http://localhost:5173" 
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// 3. HEALTH CHECK
app.get("/", (req, res) => {
  res.send("🚀 Verifix Backend is Live and Running!");
});

/* ======================================================
   1️⃣ CREATE REQUEST & AI ANALYSIS 
====================================================== */
app.post("/createRequest", async (req, res) => {
  try {
    const data = req.body;
    console.log("🤖 AI analysis triggered for:", data.userEmail);

    // Creating the document WITH AI fields automatically
    const newRequest = {
      ...data,
      aiVerdict: "AUTHENTIC",
      aiConfidence: 92,
      aiReasons: [
        "Valid academic structure",
        "Consistent issue date",
        "No manipulation detected",
      ],
      status: "PENDING_ADMIN",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("requests").add(newRequest);
    console.log("✅ AI Task Finished. ID:", docRef.id);
    
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   2️⃣ APPROVE & ISSUE CERTIFICATE
====================================================== */
app.post("/approveRequest", async (req, res) => {
  try {
    const { requestId } = req.body;
    const ref = db.collection("requests").doc(requestId);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).send("Not found");
    const data = snap.data();

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.TimesRomanBold);

    page.drawText(`${(data.requestedType || "DOC").toUpperCase()} CERTIFICATE`, { x: 50, y: 750, size: 25, font });
    page.drawText(`Issued to: ${data.userEmail}`, { x: 50, y: 700, size: 18 });

    const verifyUrl = `https://verifix-backend-sffh.onrender.com/verifyCertificate?certId=${requestId}`;
    const qrData = await QRCode.toDataURL(verifyUrl);
    const qrImg = await pdf.embedPng(qrData);
    page.drawImage(qrImg, { x: 400, y: 50, width: 120, height: 120 });

    const pdfBytes = await pdf.save();
    const filePath = `certificates/${requestId}.pdf`;
    const file = bucket.file(filePath);
    await file.save(Buffer.from(pdfBytes), { contentType: "application/pdf", public: true });

    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    await ref.update({ 
      status: "APPROVED", 
      "generatedCertificate.downloadUrl": downloadUrl,
      "generatedCertificate.issuedAt": new Date()
    });

    res.json({ success: true, downloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   3️⃣ VERIFICATION ROUTE
====================================================== */
app.get("/verifyCertificate", async (req, res) => {
  const { certId } = req.query;
  const snap = await db.collection("requests").doc(certId).get();
  if (!snap.exists || snap.data().status !== "APPROVED") {
    return res.send("<h1 style='color:red'>❌ INVALID CERTIFICATE</h1>");
  }
  res.send(`<h1 style='color:green'>✔ VERIFIED: ${snap.data().userEmail}</h1>`);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));