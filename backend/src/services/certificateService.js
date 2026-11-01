const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generates an archival PDF certificate for a registered work.
 * Incorporates Mocha Brown (#261912 / #38261B) and Champagne Gold (#CB9F54 / #E6CFA1) styling.
 * 
 * @param {Object} work - The Work mongoose document or plain object
 * @param {string} verificationUrl - The public verification URL for this work
 * @returns {Promise<Buffer>} - Resolves with the generated PDF Buffer
 */
const generateCertificateBuffer = async (work, verificationUrl) => {
  // Generate QR Code Buffer
  const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
    width: 140,
    margin: 1,
    color: {
      dark: '#261912', // Mocha brown
      light: '#FAF6F0', // Ivory parchment
    },
  });

  return new Promise((resolve, reject) => {
    try {
      // Create landscape document for classic diploma / certificate proportion
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 36, bottom: 36, left: 40, right: 40 },
        info: {
          Title: `PubSeal Certificate - ${work.registrationId}`,
          Author: 'PubSeal Digital Registry',
          Subject: `Registration Certificate for ${work.title}`,
          Keywords: `PubSeal, SHA256, ${work.sha256Hash}, ${work.registrationId}`,
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // 1. Background Fill: Warm Ivory / Fine Parchment
      doc.rect(0, 0, pageWidth, pageHeight).fill('#FAF6F0');

      // 2. Borders: Double ornate frame in Champagne Gold and Mocha Brown
      // Outer border (Mocha brown)
      doc.rect(18, 18, pageWidth - 36, pageHeight - 36)
        .lineWidth(2.5)
        .stroke('#261912');

      // Middle thin border (Champagne Gold)
      doc.rect(24, 24, pageWidth - 48, pageHeight - 48)
        .lineWidth(1)
        .stroke('#CB9F54');

      // Inner border with corner ornaments
      doc.rect(28, 28, pageWidth - 56, pageHeight - 56)
        .lineWidth(0.5)
        .stroke('#E6CFA1');

      // Corner geometric accents (Champagne Gold diamond squares)
      const cornerOffset = 24;
      const drawCorner = (x, y) => {
        doc.save();
        doc.rect(x - 4, y - 4, 8, 8).fill('#CB9F54');
        doc.restore();
      };
      drawCorner(cornerOffset, cornerOffset);
      drawCorner(pageWidth - cornerOffset, cornerOffset);
      drawCorner(cornerOffset, pageHeight - cornerOffset);
      drawCorner(pageWidth - cornerOffset, pageHeight - cornerOffset);

      // 3. Header: PubSeal Brand Crest
      doc.font('Helvetica-Bold')
        .fontSize(22)
        .fillColor('#261912')
        .text('PUBSEAL', 0, 48, { align: 'center', characterSpacing: 6 });

      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#CB9F54')
        .text('SECURE DIGITAL OWNERSHIP REGISTRY FOR WRITERS', 0, 76, {
          align: 'center',
          characterSpacing: 3,
        });

      // Horizontal separator line with gold center
      doc.moveTo(pageWidth / 2 - 180, 96).lineTo(pageWidth / 2 + 180, 96).lineWidth(0.8).stroke('#CB9F54');
      doc.circle(pageWidth / 2, 96, 3).fill('#CB9F54');

      // 4. Certificate Title
      doc.font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#261912')
        .text('CERTIFICATE OF DIGITAL REGISTRATION & CRYPTOGRAPHIC INTEGRITY', 0, 110, {
          align: 'center',
          characterSpacing: 1.5,
        });

      // 5. Formal Statement
      doc.font('Helvetica')
        .fontSize(10)
        .fillColor('#5A3E2A')
        .text(
          'This document certifies that the literary work and digital file detailed below have been formally registered in the PubSeal immutable digital registry. An authoritative SHA-256 cryptographic digest was computed from the raw binary contents upon submission.',
          70,
          136,
          { align: 'center', width: pageWidth - 140, lineGap: 3 }
        );

      // 6. Main Metadata Box (Ivory with gold border)
      const boxX = 60;
      const boxY = 175;
      const boxW = pageWidth - 120;
      const boxH = 240;

      doc.roundedRect(boxX, boxY, boxW, boxH, 4)
        .fillAndStroke('#FFFDF9', '#E6CFA1');

      // Left Column: Work Details
      const col1X = boxX + 24;
      let currY = boxY + 14;

      const renderMetaRow = (label, value, isBold = false) => {
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#846023').text(label.toUpperCase(), col1X, currY);
        doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(10.5)
          .fillColor('#261912')
          .text(value || 'N/A', col1X + 130, currY, { width: 340, ellipsis: true });
        currY += 21;
      };

      renderMetaRow('Registration ID', work.registrationId, true);
      renderMetaRow('Work Title', work.title, true);
      renderMetaRow('Author / Creator', work.authorName);
      renderMetaRow('Work Category', work.category);
      renderMetaRow('Document Version', `Version ${work.versionNumber || 1}${work.currentVersion && work.currentVersion === work.versionNumber ? ' (Latest)' : ''}`);
      renderMetaRow('Original Filename', work.originalFilename);
      
      const formattedDate = new Date(work.registeredAt).toUTCString();
      renderMetaRow('Timestamp (UTC)', formattedDate);

      // QR Code Box on the Right side of metadata
      const qrX = boxX + boxW - 145;
      const qrY = boxY + 16;
      doc.image(qrCodeBuffer, qrX, qrY, { width: 110, height: 110 });
      doc.font('Helvetica')
        .fontSize(7.5)
        .fillColor('#7C573D')
        .text('Scan to Verify Online', qrX - 5, qrY + 116, { width: 120, align: 'center' });

      // 7. Cryptographic Fingerprint Section (Inside Box)
      const hashBoxY = currY + 6;
      doc.rect(col1X, hashBoxY, boxW - 48, 48)
        .fillAndStroke('#F4EBE1', '#CB9F54');

      doc.font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#7C573D')
        .text('OFFICIAL SHA-256 DIGITAL FINGERPRINT (RAW BINARY DIGEST)', col1X + 12, hashBoxY + 8, {
          characterSpacing: 1,
        });

      doc.font('Courier')
        .fontSize(9.5)
        .fillColor('#261912')
        .text(work.sha256Hash, col1X + 12, hashBoxY + 24, {
          characterSpacing: 1.2,
        });

      // 8. Seal Crest & Signoff
      const footerY = boxY + boxH + 16;

      // Small Golden Seal badge graphic on the left
      doc.circle(95, footerY + 24, 18).lineWidth(1.5).fillAndStroke('#F6EED6', '#CB9F54');
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#846023').text('SEALED', 75, footerY + 21, { width: 40, align: 'center' });

      // Disclaimer on the right / center
      doc.font('Helvetica')
        .fontSize(7.5)
        .fillColor('#7C573D')
        .text(
          'IMPORTANT NOTICE: This certificate records a digital registration and cryptographic fingerprint. It serves as independent, timestamped digital evidence that the exact binary artifact existed in the possession of the registrant at the recorded time. It does not constitute a judicial determination of copyright ownership or prevent subsequent unauthorized copying.',
          135,
          footerY + 12,
          { width: pageWidth - 200, align: 'justify', lineGap: 1.5 }
        );

      // System ID footer
      doc.font('Courier')
        .fontSize(7)
        .fillColor('#B58F70')
        .text(`REG-TOKEN: ${work.registrationId} | HASH: ${work.sha256Hash.substring(0, 16)}... | REGISTRY: PUBSEAL-CORE-V1`, 0, pageHeight - 24, {
          align: 'center',
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateCertificateBuffer,
};

