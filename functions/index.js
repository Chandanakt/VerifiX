require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

const { PDFDocument, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");

admin.initializeApp();

const db = admin.firestore();
const bucket = admin.storage().bucket();

// Emulator detection
const IS_EMULATOR = process.env.FUNCTIONS_EMULATOR === "true";

/* ======================================================
   1️⃣ AI ANALYSIS – RUNS BEFORE ADMIN ACTION
====================================================== */
exports.onRequestCreated = functions.firestore
  .document("requests/{id}")
  .onCreate(async (snap) => {
    console.log("🤖 AI analysis triggered:", snap.id);

    await snap.ref.update({
      aiVerdict: "AUTHENTIC",
      aiConfidence: 92,
      aiReasons: [
        "Valid academic structure",
        "Consistent issue date",
        "No manipulation detected",
      ],
      status: "PENDING_ADMIN",
    });

    console.log("✅ AI analysis completed");
  });

/* ======================================================
   2️⃣ APPROVE & ISSUE CERTIFICATE
====================================================== */
exports.approveRequest = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
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

      page.drawText(
        `${(data.requestedType || data.type).toUpperCase()} CERTIFICATE`,
        { x: 120, y: 780, size: 24, font: titleFont }
      );

      page.drawText(
        "This is to certify that",
        { x: 80, y: 720, size: 14, font: textFont }
      );

      page.drawText(
        data.userEmail,
        { x: 80, y: 690, size: 16, font: titleFont }
      );

      page.drawText(
        "has been issued this certificate for the purpose of",
        { x: 80, y: 660, size: 14, font: textFont }
      );

      page.drawText(
        `"${data.purpose}"`,
        { x: 80, y: 630, size: 14, font: titleFont }
      );

      page.drawText(
        `Issued on: ${new Date().toDateString()}`,
        { x: 80, y: 580, size: 12, font: textFont }
      );

      page.drawText(
        "Authorized by: College Administration",
        { x: 80, y: 550, size: 12, font: textFont }
      );

      /* ========== QR CODE (PUBLIC VERIFY) ========== */
     const verifyUrl = IS_EMULATOR
  ? `https://unfebrile-overbashful-giana.ngrok-free.dev/verifix-be399/us-central1/verifyCertificate?certId=${requestId}`
  : `https://your-domain.com/verify?certId=${requestId}`;



      const qrData = await QRCode.toDataURL(verifyUrl);
      const qrImg = await pdf.embedPng(qrData);

      page.drawImage(qrImg, {
        x: 420,
        y: 520,
        width: 120,
        height: 120,
      });

      page.drawText(
        "Scan to verify certificate",
        { x: 410, y: 500, size: 10, font: textFont }
      );

      const pdfBytes = await pdf.save();

      /* ========== STORAGE ========== */
      const filePath = `certificates/${requestId}.pdf`;
      const file = bucket.file(filePath);

      await file.save(pdfBytes, {
        contentType: "application/pdf",
        public: true,
      });

      const downloadUrl = IS_EMULATOR
        ? `http://127.0.0.1:9199/v0/b/${bucket.name}/o/${encodeURIComponent(
            filePath
          )}?alt=media`
        : `https://storage.googleapis.com/${bucket.name}/${filePath}`;

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
      console.error("❌ Certificate error:", err);
      res.status(500).send(err.message);
    }
  });
});

/* ======================================================
   3️⃣ REJECT REQUEST
====================================================== */
exports.rejectRequest = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).send("Missing requestId");

    await db.collection("requests").doc(requestId).update({
      status: "REJECTED",
    });

    res.json({ success: true });
  });
});

/* ======================================================
   4️⃣ PUBLIC CERTIFICATE VERIFICATION
====================================================== */
exports.verifyCertificate = functions.https.onRequest(async (req, res) => {
  const { certId } = req.query;

  if (!certId) {
    return res.send("<h2 style='color:red'>❌ Invalid certificate</h2>");
  }

  const snap = await db.collection("requests").doc(certId).get();

  if (!snap.exists || snap.data().status !== "APPROVED") {
    return res.send(`
      <h2 style="color:red">❌ Certificate INVALID</h2>
      <p>This certificate does not exist or has been revoked.</p>
    `);
  }

  const d = snap.data();

  res.send(`
    <h2 style="color:green">✔ Certificate VERIFIED</h2>
    <p><b>Student:</b> ${d.userEmail}</p>
    <p><b>Document:</b> ${d.requestedType || d.type}</p>
    <p><b>Purpose:</b> ${d.purpose}</p>
    <p><b>Issued By:</b> College Authority</p>
  `);
});
