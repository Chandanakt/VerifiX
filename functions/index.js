const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");
const vision = require("@google-cloud/vision");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();

// 🔐 Secure API key (DO NOT hardcode)
const genAI = new GoogleGenerativeAI(
  functions.config().gemini.key
);

const visionClient = new vision.ImageAnnotatorClient();

/* ======================================================
   OCR USING GOOGLE VISION API
====================================================== */
async function runOcrOnUrl(url) {
  const [res] = await visionClient.textDetection({
    image: { source: { imageUri: url } },
  });

  return res.textAnnotations?.[0]?.description || "";
}

/* ======================================================
   GEMINI AI RISK ANALYSIS
====================================================== */
async function analyzeRisk(text, meta) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
You are a forensic academic document expert.

Analyze the following academic document for authenticity.

Check for:
- Logical inconsistencies (CGPA vs semester/year)
- Date conflicts
- Formatting anomalies
- Suspicious patterns

Return STRICT JSON:
{
  "verdict": "AUTHENTIC | SUSPICIOUS | FRAUDULENT",
  "confidence": number,
  "reasons": string[]
}

Document Type: ${meta.type}
User Email: ${meta.userEmail}

DOCUMENT TEXT:
${text}
`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (e) {
    return {
      verdict: "SUSPICIOUS",
      confidence: 50,
      reasons: ["AI parsing failed or uncertain response"],
    };
  }
}

/* ======================================================
   🔥 FIRESTORE TRIGGER — AI PIPELINE
====================================================== */
exports.onRequestCreated = functions.firestore
  .document("requests/{id}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const url = data.attachment?.url;

    if (!url) return;

    try {
      // 1️⃣ OCR
      const ocrText = await runOcrOnUrl(url);

      // 2️⃣ Gemini AI
      const ai = await analyzeRisk(ocrText, data);

      // 3️⃣ Decide flow
      const nextStatus =
        ai.confidence >= 80
          ? "APPROVED"
          : "PENDING_ADMIN_REVIEW";

      // 4️⃣ Update Firestore
      await snap.ref.update({
        ocrText,
        aiVerdict: ai.verdict,
        aiConfidence: ai.confidence,
        aiReasons: ai.reasons,
        status: nextStatus,
      });
    } catch (err) {
      console.error("AI pipeline failed:", err);
      await snap.ref.update({
        status: "PENDING_ADMIN_REVIEW",
      });
    }
  });

/* ======================================================
   ✅ ADMIN APPROVAL → CERTIFICATE GENERATION
====================================================== */
exports.approveRequest = functions.https.onRequest(async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) return res.status(400).send("Missing requestId");

  const ref = db.collection("requests").doc(requestId);
  const docSnap = await ref.get();

  if (!docSnap.exists) return res.status(404).send("Request not found");

  const data = docSnap.data();

  // Create PDF certificate
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const font = await pdf.embedFont(StandardFonts.TimesRoman);

  page.drawText(`${data.type} Certificate`, {
    x: 50,
    y: 780,
    size: 24,
    font,
  });

  page.drawText(`Issued to: ${data.userEmail}`, {
    x: 50,
    y: 740,
    size: 14,
    font,
  });

  page.drawText(`Purpose: ${data.purpose}`, {
    x: 50,
    y: 710,
    size: 14,
    font,
  });

  // QR Code for verification
  const verifyUrl = `https://YOUR_HOST/verify?certId=${requestId}`;
  const qrData = await QRCode.toDataURL(verifyUrl);
  const qrImg = await pdf.embedPng(qrData);

  page.drawImage(qrImg, {
    x: 420,
    y: 620,
    width: 120,
    height: 120,
  });

  const bytes = await pdf.save();

  // Save to Firebase Storage
  const file = storage.file(`certificates/${requestId}.pdf`);
  await file.save(bytes, {
    contentType: "application/pdf",
    public: false,
  });

  const [downloadUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  await ref.update({
    status: "APPROVED",
    generatedCertificate: { downloadUrl },
  });

  res.json({ success: true, downloadUrl });
});

/* ======================================================
   ❌ ADMIN REJECTION
====================================================== */
exports.rejectRequest = functions.https.onRequest(async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) return res.status(400).send("Missing requestId");

  await db.collection("requests").doc(requestId).update({
    status: "REJECTED",
  });

  res.json({ success: true });
});

/* ======================================================
   🔍 PUBLIC CERTIFICATE VERIFICATION
====================================================== */
exports.verifyCertificate = functions.https.onRequest(async (req, res) => {
  const { certId } = req.query;
  if (!certId) return res.send("Invalid verification request");

  const doc = await db.collection("requests").doc(certId).get();

  if (!doc.exists || doc.data().status !== "APPROVED") {
    return res.send("❌ Certificate invalid or not approved");
  }

  const d = doc.data();

  res.send(`
    <h2>Certificate Verification – VALID ✔️</h2>
    <p><strong>User:</strong> ${d.userEmail}</p>
    <p><strong>Type:</strong> ${d.type}</p>
    <p><strong>Purpose:</strong> ${d.purpose}</p>
    <p><strong>Verified by:</strong> TrustAnchor AI</p>
  `);
});
