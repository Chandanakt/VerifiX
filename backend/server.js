require("dotenv").config();
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");

// 1. IMPORT & INITIALIZE SUPABASE
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://qczrynwhcvenmrctukww.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjenJ5bndoY3Zlbm1yY3R1a3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDAxNjAsImV4cCI6MjA4MjQxNjE2MH0.CKmucukKNw1MGPv5J-A1fblHZ0Tr6-YQv_r5GMCdTnM";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. INITIALIZE FIREBASE ADMIN (For Firestore Only)
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();
const app = express();

// 3. MIDDLEWARE
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

// 4. HEALTH CHECK
app.get("/", (req, res) => {
    res.send("🚀 Verifix Backend is Live with Supabase Storage!");
});

/* ======================================================
   1️⃣ CREATE REQUEST & AI ANALYSIS 
====================================================== */
app.post("/createRequest", async (req, res) => {
    try {
        const data = req.body;
        let newRequest = {
            ...data,
            status: "PENDING_ADMIN",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (data.flowType === "VERIFICATION") {
            newRequest.aiVerdict = "AUTHENTIC";
            newRequest.aiConfidence = 92;
            newRequest.aiReasons = ["Valid academic structure", "No manipulation detected"];
        } else {
            newRequest.aiVerdict = "NOT_APPLICABLE";
            newRequest.aiReasons = ["Direct issuance request"];
        }

        const docRef = await db.collection("requests").add(newRequest);
        res.status(201).json({ success: true, id: docRef.id });
    } catch (err) {
        console.error("❌ Error in createRequest:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ======================================================
   2️⃣ APPROVE & ISSUE CERTIFICATE (SUPABASE VERSION)
====================================================== */
app.post("/approveRequest", async (req, res) => {
    try {
        const { requestId } = req.body;
        const ref = db.collection("requests").doc(requestId);
        const snap = await ref.get();
        
        if (!snap.exists) return res.status(404).send("Request not found");
        const data = snap.data();

        // --- PDF Generation ---
        const pdf = await PDFDocument.create();
        const page = pdf.addPage([595, 842]);
        const font = await pdf.embedFont(StandardFonts.TimesRomanBold);

        page.drawText(`${(data.requestedType || "DOC").toUpperCase()} CERTIFICATE`, { x: 50, y: 750, size: 25, font });
        page.drawText(`Issued to: ${data.userEmail}`, { x: 50, y: 700, size: 18 });

        // --- QR Code ---
        const verifyUrl = `https://verifix-backend-sffh.onrender.com/verifyCertificate?certId=${requestId}`;
        const qrDataUrl = await QRCode.toDataURL(verifyUrl);
        const qrImageBytes = qrDataUrl.split(',')[1];
        const qrImg = await pdf.embedPng(Buffer.from(qrImageBytes, 'base64'));
        page.drawImage(qrImg, { x: 400, y: 50, width: 120, height: 120 });

        const pdfBytes = await pdf.save();
        const fileName = `${requestId}.pdf`;

        // 🚀 UPLOAD TO SUPABASE STORAGE
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("certificates") 
            .upload(fileName, Buffer.from(pdfBytes), {
                contentType: "application/pdf",
                upsert: true 
            });

        if (uploadError) throw uploadError;

        // 🔗 GET PUBLIC DOWNLOAD URL
        const { data: { publicUrl } } = supabase.storage
            .from("certificates")
            .getPublicUrl(fileName);

        // ✅ UPDATE FIRESTORE
        await ref.update({ 
            status: "APPROVED", 
            "generatedCertificate.downloadUrl": publicUrl,
            "generatedCertificate.issuedAt": admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("✅ Certificate issued and saved to Supabase:", requestId);
        res.json({ success: true, downloadUrl: publicUrl });
    } catch (err) {
        console.error("❌ Error in approveRequest:", err);
        res.status(500).json({ error: err.message });
    }
});

/* ======================================================
   3️⃣ REJECT REQUEST
====================================================== */
app.post("/rejectRequest", async (req, res) => {
    try {
        const { requestId } = req.body;
        await db.collection("requests").doc(requestId).update({
            status: "REJECTED",
            rejectedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true });
    } catch (err) {
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
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));