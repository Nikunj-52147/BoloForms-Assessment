import express from "express";
import cors from "cors";
import fs from "fs";
import { PDFDocument } from "pdf-lib";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
await client.connect();
const db = client.db("pdf_signing");
const auditCollection = db.collection("audit_trail");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); 

const upload = multer({ storage: multer.memoryStorage() });

function sha256Hash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Serve signed PDFs
app.use("/signed_pdfs", express.static("signed_pdfs"));

app.post("/sign-pdf", async (req, res) => {
  try {
    const { pdfBase64, signature, coordinates } = req.body;

    // Convert PDF base64 to bytes
    const pdfBytes = Uint8Array.from(
      Buffer.from(pdfBase64.split(",")[1], "base64")
    );
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Convert signature base64 to bytes
    const sigBytes = Uint8Array.from(
      Buffer.from(signature.split(",")[1], "base64")
    );
    const sigImage = await pdfDoc.embedPng(sigBytes);

    const page = pdfDoc.getPage(coordinates.page - 1);
    const { width: pageWidth, height: pageHeight } = page.getSize();

    const originalHash = sha256Hash(pdfBytes); // hashing before signing

    // Calculate signature placement
    const boxWidth = coordinates.wPct * pageWidth;
    const boxHeight = coordinates.hPct * pageHeight;
    const sigDims = sigImage.scale(1);
    const sigRatio = sigDims.width / sigDims.height;
    const boxRatio = boxWidth / boxHeight;

    let drawWidth, drawHeight;
    if (sigRatio > boxRatio) // Signature is wider than the box
    { 
      drawWidth = boxWidth;
      drawHeight = boxWidth / sigRatio;
    } else { //Signature is taller than the box
      drawHeight = boxHeight;
      drawWidth = boxHeight * sigRatio;
    }

    const xPos = coordinates.xPct * pageWidth + (boxWidth - drawWidth) / 2;
    const yPos =
      pageHeight -
      coordinates.yPct * pageHeight -
      drawHeight -
      (boxHeight - drawHeight) / 2;

    page.drawImage(sigImage, {
      x: xPos,
      y: yPos,
      width: drawWidth,
      height: drawHeight,
    });

    const signedPdfBytes = await pdfDoc.save();
    const signedHash = sha256Hash(signedPdfBytes); // hashing after signing

    // Store in MongoDB
    await auditCollection.insertOne({
      originalHash,
      signedHash,
      timestamp: new Date(),
      page: coordinates.page,
      xPos: xPos,
      yPos: yPos,
    });

    const signedBase64 = Buffer.from(signedPdfBytes).toString("base64");

    const outputPath = path.join(
      __dirname,
      "signed_pdfs",
      `signed_${Date.now()}.pdf`
    );
    fs.writeFileSync(outputPath, signedPdfBytes); // save signed PDF

    res.json({ url: `data:application/pdf;base64,${signedBase64}` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Bad request. Check your payload." });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
