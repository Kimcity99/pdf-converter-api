const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const { fromPath } = require("pdf2pic"); // Import pdf2pic for PDF to JPG conversion

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from 'public'

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// File upload config
const upload = multer({ dest: "uploads/" });

// Convert text to PDF
app.post("/convert/text-to-pdf", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        page.drawText(text, { x: 50, y: 350 });

        const pdfBytes = await pdfDoc.save();
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        res.status(500).json({ error: "Error generating PDF" });
    }
});

// Convert image to PDF
app.post("/convert/image-to-pdf", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);

        const imageBytes = fs.readFileSync(req.file.path);
        const image = await pdfDoc.embedJpg(imageBytes);
        page.drawImage(image, { x: 50, y: 100, width: 500, height: 300 });

        const pdfBytes = await pdfDoc.save();
        res.setHeader("Content-Type", "application/pdf");
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        res.status(500).json({ error: "Error converting image to PDF" });
    }
});

// Convert PDF to JPG
app.post("/convert/pdf-to-jpg", upload.single("pdf"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });

        // Set up PDF to JPG conversion options
        const convert = fromPath(req.file.path, {
            density: 100,
            saveFilename: "output",
            savePath: "uploads/",
            format: "jpg",
            width: 1024,
            height: 1024,
        });

        // Convert the first page to JPG
        convert(1).then((resolve) => {
            res.setHeader("Content-Type", "image/jpeg");
            res.sendFile(resolve.path, { root: __dirname });
        }).catch((error) => {
            res.status(500).json({ error: "Error converting PDF to JPG" });
        });

    } catch (error) {
        res.status(500).json({ error: "Error converting PDF to JPG" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`PDF Converter API running at http://localhost:${PORT}`);
});
