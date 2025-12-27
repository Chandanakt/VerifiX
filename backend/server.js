require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");

// 1. IMPORT SUPABASE 
const { createClient } = require("@supabase/supabase-js");

// 2. INITIALIZE SUPABASE
const SUPABASE_URL = "https://qczrynwhcvenmrctukww.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjenJ5bndoY3Zlbm1yY3R1a3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDAxNjAsImV4cCI6MjA4MjQxNjE2MH0.CKmucukKNw1MGPv5J-A1fblHZ0Tr6-YQv_r5GMCdTnM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 3. INITIALIZE FIREBASE ADMIN (Firestore Only)
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // ❌ REMOVED storageBucket: "verifix-be399.appspot.com"
  });
}

const db = admin.firestore();
const app = express();

// 4. MIDDLEWARE 
app.use(cors({
  origin: ["https://verifix-be399.web.app", "https://verifix-be399.firebaseapp.com", "http://localhost:5173"],
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Verifix Backend is Live with Supabase!");
});

/* ======================================================
   APPROVE & ISSUE CERTIFICATE (FIXED ROUTE)
====================================================== */
app.post("/approveRequest", async (req, res) => {
  try {
    const { requestId } = req.body;
    const ref = db.collection("requests").doc(requestId);
    const snap = await ref.get();
    
    if (!snap.exists) return res.status(404).send("Request not found");
    const data = snap.data();

    // 📄 PDF Generation
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.TimesRomanBold);

    page.drawText(`${(data.requestedType || "DOC").toUpperCase()} CERTIFICATE`, { x: 50, y: 750, size: 25, font });
    page.drawText(`Issued to: ${data.userEmail}`, { x: 50, y: 700, size: 18 });

    // 🏁 QR Code
    const verifyUrl = `https://verifix-backend-sffh.onrender.com/verifyCertificate?certId=${requestId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);
    const qrImageBytes = qrDataUrl.split(',')[1];
    const qrImg = await pdf.embedPng(Buffer.from(qrImageBytes, 'base64'));
    page.drawImage(qrImg, { x: 400, y: 50, width: 120, height: 120 });

    const pdfBytes = await pdf.save();
    const fileName = `${requestId}.pdf`;

    // 🚀 5. UPLOAD TO SUPABASE (This replaces the Firebase code)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("certificates") 
      .upload(fileName, Buffer.from(pdfBytes), {
        contentType: "application/pdf",
        upsert: true 
      });

    if (uploadError) {
      console.error("Supabase Upload Error:", uploadError);
      throw uploadError;
    }

    // 🔗 6. GET PUBLIC LINK
    const { data: { publicUrl } } = supabase.storage
      .from("certificates")
      .getPublicUrl(fileName);

    // ✅ 7. UPDATE FIRESTORE
    await ref.update({ 
      status: "APPROVED", 
      "generatedCertificate.downloadUrl": publicUrl,
      "generatedCertificate.issuedAt": admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, downloadUrl: publicUrl });
  } catch (err) {
    console.error("❌ 500 Error Details:", err);
    res.status(500).json({ error: err.message });
  }
});

// (Keep your createRequest, rejectRequest, and verifyCertificate routes as they were)
// ...

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));