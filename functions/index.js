const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const QRCode = require("qrcode");
const vision = require("@google-cloud/vision");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const visionClient = new vision.ImageAnnotatorClient();

async function runOcrOnUrl(url) {
  const [res] = await visionClient.textDetection({ image: { source: { imageUri: url } } });
  return res.textAnnotations?.[0]?.description || "";
}

async function analyzeRisk(text, meta) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
Analyze this document text for authenticity. Output JSON:
{
"score": number,
"level": "LOW" | "MEDIUM" | "HIGH",
"reasons": string[]
}

Type: ${meta.type}
User: ${meta.userEmail}

TEXT:
${text}
  `;

  const result = await model.generateContent(prompt);
  try {
    return JSON.parse(result.response.text());
  } catch {
    return { score: 50, level: "MEDIUM", reasons: ["AI parsing failed."] };
  }
}

exports.onRequestCreated = functions.firestore
  .document("requests/{id}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const url = data.attachment?.url;

    if (!url) return;

    const ocr = await runOcrOnUrl(url);
    const risk = await analyzeRisk(ocr, data);

    await snap.ref.update({
      ocrText: ocr,
      aiRisk: risk,
      status: "READY_FOR_ADMIN",
    });
  });

exports.approveRequest = functions.https.onRequest(async (req, res) => {
  const id = req.body.requestId;
  const ref = db.collection("requests").doc(id);
  const docData = (await ref.get()).data();

  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.TimesRoman);

  page.drawText(`${docData.type} Certificate`, { x: 50, y: 700, size: 24, font });
  page.drawText(`Issued to: ${docData.userEmail}`, { x: 50, y: 660, size: 14, font });
  page.drawText(`Purpose: ${docData.purpose}`, { x: 50, y: 630, size: 14, font });

  const verifyUrl = `https://YOUR_HOST/verify?certId=${id}`;
  const qrData = await QRCode.toDataURL(verifyUrl);
  const qrImg = await pdf.embedPng(qrData);
  page.drawImage(qrImg, { x: 400, y: 500, width: 120, height: 120 });

  const bytes = await pdf.save();

  const file = storage.bucket().file(`certificates/${id}.pdf`);
  await file.save(bytes, { contentType: "application/pdf" });

  const [downloadUrl] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  await ref.update({
    status: "APPROVED",
    generatedCertificate: { downloadUrl },
  });

  res.json({ message: "Approved" });
});

exports.rejectRequest = functions.https.onRequest(async (req, res) => {
  const id = req.body.requestId;
  await db.collection("requests").doc(id).update({ status: "REJECTED" });
  res.json({ message: "Rejected" });
});

exports.verifyCertificate = functions.https.onRequest(async (req, res) => {
  const id = req.query.certId;
  const doc = await db.collection("requests").doc(id).get();

  if (!doc.exists || doc.data().status !== "APPROVED")
    return res.send("❌ Invalid or not approved");

  const d = doc.data();

  res.send(`
    <h2>Certificate Verification – VALID ✔️</h2>
    <p>User: ${d.userEmail}</p>
    <p>Type: ${d.type}</p>
    <p>Purpose: ${d.purpose}</p>
  `);
});
