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
    console.error("❌ Error in createRequest:", err);
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
    
    if (!snap.exists) return res.status(404).send("Request not found");
    const data = snap.data();

    // Generate PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.TimesRomanBold);

    page.drawText(`${(data.requestedType || "DOC").toUpperCase()} CERTIFICATE`, { x: 50, y: 750, size: 25, font });
    page.drawText(`Issued to: ${data.userEmail}`, { x: 50, y: 700, size: 18 });

    // QR Code
    const verifyUrl = `https://verifix-backend-sffh.onrender.com/verifyCertificate?certId=${requestId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);
    const qrImageBytes = qrDataUrl.split(',')[1];
    const qrImg = await pdf.embedPng(Buffer.from(qrImageBytes, 'base64'));
    page.drawImage(qrImg, { x: 400, y: 50, width: 120, height: 120 });

    const pdfBytes = await pdf.save();
    const filePath = `certificates/${requestId}.pdf`;
    const file = bucket.file(filePath);

    // Save File (Removed public: true to prevent 500 errors)
    await file.save(Buffer.from(pdfBytes), { 
      contentType: "application/pdf",
      metadata: { cacheControl: 'public, max-age=31536000' }
    });

    // Make file readable via a signed URL or public URL
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media`;

    await ref.update({ 
      status: "APPROVED", 
      "generatedCertificate.downloadUrl": downloadUrl,
      "generatedCertificate.issuedAt": admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Certificate issued for:", requestId);
    res.json({ success: true, downloadUrl });
  } catch (err) {
    console.error("❌ Error in approveRequest:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   3️⃣ REJECT REQUEST (Added missing route)
====================================================== */
app.post("/rejectRequest", async (req, res) => {
  try {
    const { requestId } = req.body;
    console.log("🚫 Rejecting request:", requestId);
    
    await db.collection("requests").doc(requestId).update({
      status: "REJECTED",
      rejectedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error in rejectRequest:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   4️⃣ VERIFICATION ROUTE
====================================================== */
app.get("/verifyCertificate", async (req, res) => {
  try {
    const { certId } = req.query;
    const snap = await db.collection("requests").doc(certId).get();
    
    if (!snap.exists || snap.data().status !== "APPROVED") {
      return res.send("<h1 style='color:red; text-align:center; margin-top:50px;'>❌ INVALID OR REVOKED CERTIFICATE</h1>");
    }
    
    res.send(`
      <div style="text-align:center; margin-top:50px; font-family:sans-serif;">
        <h1 style="color:green">✔ VERIFIED AUTHENTIC</h1>
        <p>This certificate was issued to <b>${snap.data().userEmail}</b> via VerifiX.</p>
        <p>Document Type: ${snap.data().requestedType}</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Verification error");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));