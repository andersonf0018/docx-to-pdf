const cors = require('cors');
const express = require('express');
const { configDotenv } = require('dotenv');
const bodyParser = require('body-parser');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

configDotenv();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.post('/docx-to-pdf', async (req, res) => {
  try {
    const { base64Docx } = req.body;

    const docxBuffer = Buffer.from(base64Docx, 'base64');

    const docxPath = path.join(__dirname, 'temp.docx');
    fs.writeFileSync(docxPath, docxBuffer);

    const pdfBuffer = await new Promise((resolve, reject) => {
      libre.convert(docxBuffer, '.pdf', undefined, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    const base64Pdf = pdfBuffer.toString('base64');

    if (fs.existsSync(docxPath)) {
      fs.unlinkSync(docxPath);
    }

    res.json({ base64Pdf });
  } catch (error) {
    console.error('Error converting document:', error);
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});