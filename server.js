const express = require('express');
const bodyParser = require('body-parser');
const libre = require('libreoffice-convert');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/docx-to-pdf', async (req, res) => {
  try {
    const { base64Docx } = req.body;

    const docxBuffer = Buffer.from(base64Docx, 'base64');

    const docxPath = path.join(__dirname, 'temp.docx');
    fs.writeFileSync(docxPath, docxBuffer);

    const pdfPath = path.join(__dirname, 'temp.pdf');
    const pdfBuffer = await new Promise((resolve, reject) => {
      libre.convert(docxBuffer, '.pdf', undefined, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });

    fs.writeFileSync(pdfPath, pdfBuffer);

    const base64Pdf = pdfBuffer.toString('base64');

    fs.unlinkSync(docxPath);
    fs.unlinkSync(pdfPath);

    res.json({ base64Pdf });
  } catch (error) {
    console.error('Error converting document:', error);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});