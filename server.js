
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { exec } = require("child_process");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).send("No file uploaded");

    const ext = file.originalname.split(".").pop().toLowerCase();
    const filePath = file.path;
    let text = "";

    try {
        if (ext === "pdf") {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            text = data.text;
        } else if (ext === "docx") {
            const result = await mammoth.extractRawText({ path: filePath });
            text = result.value;
        } else if (ext === "pptx") {
            exec(`unzip -p ${filePath} ppt/slides/slide1.xml`, (err, stdout) => {
                if (err) return res.status(500).send("Failed to parse PPTX");
                const extracted = stdout.toString().replace(/<.*?>/g, " ");
                res.send({ text: extracted });
            });
            return;
        } else {
            return res.status(400).send("Unsupported file type");
        }
        res.send({ text });
    } catch (e) {
        res.status(500).send("Error reading file");
    } finally {
        fs.unlink(filePath, () => {});
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
