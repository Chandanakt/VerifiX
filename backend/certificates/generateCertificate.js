import { PDFDocument, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

export async function generateCertificate(data, id) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText("STUDY CERTIFICATE", { x: 200, y: 750, size: 20, font });
  page.drawText(`Student: ${data.userEmail}`, { x: 50, y: 680, size: 12, font });
  page.drawText(`Purpose: ${data.purpose}`, { x: 50, y: 660, size: 12, font });

  const verifyUrl = `https://verifix.app/verify/${id}`;
  const qr = await QRCode.toDataURL(verifyUrl);
  const qrImg = await pdf.embedPng(qr);

  page.drawImage(qrImg, { x: 400, y: 600, width: 120, height: 120 });

  const bytes = await pdf.save();

  return {
    issuedAt: new Date().toISOString(),
    qrHash: id,
    note: "PDF generated (demo – stored securely in production)"
  };
}
