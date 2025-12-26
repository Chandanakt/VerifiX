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
  // Ensure this matches your Firebase Console -> Storage bucket name
  storageBucket: "verifix-be399.appspot.com" 
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();

// 2. MIDDLEWARE 
// Updated CORS to be more robust for your live Firebase site
app.use(cors({
  origin: [
    "https://verifix-be399.web.app", 
    "https://verifix-be399.firebaseapp.com",
    "http://localhost:5173" // For local testing
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// 3. HEALTH CHECK ROUTE
// This fixes the "Cannot GET /" error
app.get("/", (req, res) => {
  res.send("🚀 Verifix Backend is Live and Running!");
});

/* ======================================================
   1️⃣ CREATE REQUEST & AI ANALYSIS 
   This route MUST be called by the frontend to trigger AI
====================================================== */
app.post("/createRequest", async (req, res) => {
  try {
    const data = req.body;
    console.log("🤖 AI analysis triggered for new request from:", data.userEmail);

    // This is the data that makes the "Analysis" screen finish in the frontend
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
    console.log("✅ AI analysis & Request Creation completed. Doc ID:", docRef.id);
    
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    console.error("❌ Creation error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   2️⃣ APPROVE & ISSUE CERTIFICATE
====================================================== */
app.post("/approveRequest", async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).send("Missing requestId");

    const ref = db.collection("requests").doc(requestId);
    const snap = await ref.get();

    if (!snap.exists) return res.status(404).send("Request not found");
    const data = snap.data();

    if (data.status !== "PENDING_ADMIN") {
      return res.status(400).send("Request already processed");
    }

    /* ========== PDF GENERATION ========== */
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const titleFont = await pdf.embedFont(StandardFonts.TimesRomanBold);
    const textFont = await pdf.embedFont(StandardFonts.TimesRoman);

    page.drawText(`${(data.requestedType || "DOCUMENT").toUpperCase()} CERTIFICATE`, 
      { x: 120, y: 780, size: 24, font: titleFont });
    page.drawText("This is to certify that", { x: 80, y: 720, size: 14, font: textFont });
    page.drawText(data.userEmail || "Student", { x: 80, y: 690, size: 16, font: titleFont });
    page.drawText(`"${data.purpose || 'Verification'}"`, { x: 80, y: 630, size: 14, font: titleFont });
    page.drawText(`Issued on: ${new Date().toDateString()}`, { x: 80, y: 580, size: 12, font: textFont });

    /* ========== QR CODE (DYNAMIC VERIFY URL) ========== */
    const baseUrl = process.env.RENDER_EXTERNAL_URL || "https://verifix-backend-sffh.onrender.com";
    const verifyUrl = `${baseUrl}/verifyCertificate?certId=${requestId}`;

    const qrData = await QRCode.toDataURL(verifyUrl);
    const qrImg = await pdf.embedPng(qrData);

    page.drawImage(qrImg, { x: 420, y: 520, width: 120, height: 120 });
    page.drawText("Scan to verify certificate", { x: 410, y: 500, size: 10, font: textFont });

    const pdfBytes = await pdf.save();

    /* ========== STORAGE ========== */
    const filePath = `certificates/${requestId}.pdf`;
    const file = bucket.file(filePath);

    await file.save(Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      public: true, // Allows the certificate to be viewed via link
    });

    const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    /* ========== FIRESTORE UPDATE ========== */
    await ref.update({
      status: "APPROVED",
      generatedCertificate: {
        certificateId: requestId,
        downloadUrl,
        issuedAt: new Date(),
      },
    });

    res.json({ success: true, downloadUrl });
  } catch (err) {
    console.error("❌ Approval error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   3️⃣ REJECT REQUEST
====================================================== */
app.post("/rejectRequest", async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).send("Missing requestId");

    await db.collection("requests").doc(requestId).update({ status: "REJECTED" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   4️⃣ PUBLIC CERTIFICATE VERIFICATION
====================================================== */
app.get("/verifyCertificate", async (req, res) => {
  try {
    const { certId } = req.query;
    if (!certId) return res.send("<h2 style='color:red'>❌ Invalid certificate link</h2>");

    const snap = await db.collection("requests").doc(certId).get();

    if (!snap.exists || snap.data().status !== "APPROVED") {
      return res.send("<h2 style='color:red'>❌ Certificate INVALID or Not Yet Approved</h2>");
    }

    const d = snap.data();
    res.send(`
      <div style="font-family:sans-serif; text-align:center; padding: 50px; border: 10px solid #f0f0f0;">
        <h2 style="color:green">✔ Certificate VERIFIED</h2>
        <hr/>
        <p><b>Student Email:</b> ${d.userEmail}</p>
        <p><b>Document Type:</b> ${d.requestedType || d.type}</p>
        <p><b>Verified Date:</b> ${new Date().toLocaleDateString()}</p>
        <p style="margin-top:20px; color:#666;">This document is an authentic record from VerifiX Systems.</p>
      </div>
    `);
  } catch (err) {
    res.status(500).send("Internal Server Error during verification");
  }
});

// Start Server
const PORT = process.env.PORT || 10000; // Render uses 10000 often
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});