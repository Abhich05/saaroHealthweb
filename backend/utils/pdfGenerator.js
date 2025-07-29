const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const generatePrescriptionPDF = async (prescription, patientData) => {
  return new Promise((resolve, reject) => {
    const pdfDoc = new PDFDocument({ margin: 30, marginBottom: 70 });
    pdfDoc.moveDown(10);

    const publicFolder = path.join(__dirname, '../public', 'prescriptions');
    const fileName = `prescription_${prescription._id}.pdf`;
    const filePath = path.join(publicFolder, fileName);

    if (!fs.existsSync(publicFolder)) {
      fs.mkdirSync(publicFolder, { recursive: true });
    }

    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);

    pdfDoc.on('pageAdded', () => {
      pdfDoc.moveDown(10);
    });

    const pageWidth = pdfDoc.page.width;
    const leftMargin = pdfDoc.page.margins.left;
    const rightMargin = pdfDoc.page.margins.right;

    let leftText = '';
    if (patientData?.age) {
      leftText = `${patientData?.uid}: ${patientData?.fullName} (${patientData?.age}y, ${patientData?.gender}) - ${patientData?.phoneNumber}`;
    } else {
      leftText = `${patientData?.uid}: ${patientData?.fullName} (${patientData?.gender}) - ${patientData?.phoneNumber}`;
    }
    const createdAtDate = new Date();
    createdAtDate.setHours(createdAtDate.getHours() + 5);
    createdAtDate.setMinutes(createdAtDate.getMinutes() + 30);

    const imagePath = path.join(__dirname, '../public/images/prescription-logo.png');

    const rightText = `Date & Time: ${new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(createdAtDate)}`;
    const rightTextWidth = pdfDoc.widthOfString(rightText);
    const currentY = pdfDoc.y;

    const addHeaderImage = (doc) => {
      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, doc.page.margins.left, 10, { width: 550 });
        doc.moveDown(1.5);

        pdfDoc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(leftText, leftMargin, currentY, { continued: true })
          .text(rightText, pageWidth - rightMargin - rightTextWidth - 370, currentY, { align: 'right' });

        const startX = pdfDoc.page.margins.left;
        const endX = pdfDoc.page.width - pdfDoc.page.margins.right;

        pdfDoc
          .moveTo(startX-10, currentY+10)
          .lineTo(endX+10, currentY+10)
          .stroke()
          .moveDown();
      }
    };

    addHeaderImage(pdfDoc);
    pdfDoc.on('pageAdded', () => {
      addHeaderImage(pdfDoc);
    });

    const boldFont = 'Helvetica-Bold';
    const normalFont = 'Helvetica';

    let vitals = [
      { label: 'BP', value: prescription?.bloodPressure, unit: 'mm/Hg' },
      { label: 'Pulse', value: prescription?.pulse, unit: 'bpm' },
      { label: 'Weight', value: prescription?.weight, unit: 'kg' },
      { label: 'Height', value: prescription?.height, unit: 'cm' },
      { label: 'Temperature', value: prescription?.temperature, unit: '°F' },
      { label: 'Pain Score', value: prescription?.painScore, unit: '' },
    ];

    let first = true;

    vitals.forEach(vital => {
      if (vital.value !== '' && vital.value !== null) {
        if (!first) {
          pdfDoc
            .font(normalFont)
            .text('| ', { continued: true });
        }
        pdfDoc
          .font(boldFont)
          .text(`${vital.label} `, { continued: true })
          .font(normalFont)
          .text(`${vital.value} ${vital.unit} `, { continued: true });
        first = false;
      }
    });

    pdfDoc
      .text('')
      .moveDown();

    if (
      prescription?.complaints
      && prescription?.complaints.length !== 0
      && prescription?.complaints[0]
      && prescription?.complaints[0].length !== 0
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Complaints: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      const textX = pdfDoc.x + 20;
      const bulletX = pdfDoc.x + 17;
      prescription.complaints.forEach((sentence) => {
        if (sentence.trim()) {
          const textY = pdfDoc.y;

          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text('• ', bulletX, textY, { continued: true });

          pdfDoc.text(sentence.trim(), textX, textY, { align: 'left' });
          pdfDoc.moveDown(0.2);
        }
      });

      pdfDoc.moveDown(0.3);
    }

    const addFieldStylish = (label, value) => {
      if (value && value !== 'null ()' && value !== '()' && value !== ' ()') {
        const leftMargin = pdfDoc.page.margins.left;

        if (pdfDoc.y + 15 > pdfDoc.page.height - pdfDoc.page.margins.bottom) {
          pdfDoc.addPage();
        }

        pdfDoc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`${label}:`, leftMargin, pdfDoc.y, { continued: true })
          .font('Helvetica')
          .text(` ${value}`)
          .moveDown(0.3);
      }
    };

    const addMedicineEntry = (index, medicine) => {
      const pageWidth = pdfDoc.page.width;
      const leftMargin = pdfDoc.page.margins.left;
      const rightMargin = pdfDoc.page.margins.right;
      const columnWidth = (pageWidth - leftMargin - rightMargin) / 4;
      const pageBottom = pdfDoc.page.height - pdfDoc.page.margins.bottom;

      const printTableHeader = () => {
        pdfDoc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Medicine', leftMargin, pdfDoc.y-8, { width: columnWidth, align: 'left' })
          .text('Dosage', leftMargin + columnWidth, pdfDoc.y-12, { width: columnWidth, align: 'left' })
          .text('Frequency', leftMargin + columnWidth * 2, pdfDoc.y-12, { width: columnWidth, align: 'left' })
          .text('Duration', leftMargin + columnWidth * 3, pdfDoc.y-12, { width: columnWidth, align: 'left' });

        pdfDoc.moveDown(1);
        pdfDoc
          .moveTo(leftMargin, pdfDoc.y)
          .lineTo(pageWidth - rightMargin, pdfDoc.y)
          .strokeColor('#AAAAAA')
          .stroke();
    
        pdfDoc.moveDown(0.5);
      };

      if (index === 1) {
        printTableHeader();
      }

      if (pdfDoc.y + 50 > pageBottom) {
        pdfDoc.addPage();
        pdfDoc.moveDown(1);
      }

      pdfDoc
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica')
        .text(`${index}) ${medicine?.name || '-'}`, leftMargin, pdfDoc.y-8, { width: columnWidth, align: 'left' })
        .text(medicine?.dosage || '-', leftMargin + columnWidth, pdfDoc.y - 12, { width: columnWidth, align: 'left' })
        .text(medicine?.frequency || '-', leftMargin + columnWidth * 2, pdfDoc.y - 12, { width: columnWidth, align: 'left' })
        .text(medicine?.duration || '-', leftMargin + columnWidth * 3, pdfDoc.y - 12, { width: columnWidth, align: 'left' });

      let lastY = pdfDoc.y;

      if (medicine?.composition) {
        if (pdfDoc.y + 15 > pageBottom) {
          pdfDoc.addPage();
          printTableHeader();
          lastY = pdfDoc.y;
        }

        pdfDoc
          .moveDown(0.5)
          .fontSize(8)
          .font('Helvetica-Oblique')
          .text(`Composition: ${medicine?.composition}`, leftMargin, lastY, { width: pageWidth - leftMargin - rightMargin, align: 'left' });

        lastY = pdfDoc.y;
      }

      if (medicine?.notes) {
        if (pdfDoc.y + 15 > pageBottom) {
          pdfDoc.addPage();
          printTableHeader();
          lastY = pdfDoc.y;
        }
        pdfDoc
          .moveDown(0.5)
          .fontSize(9)
          .font('Helvetica-Oblique')
          .text(`Notes: ${medicine?.notes}`, leftMargin, lastY, { width: pageWidth - leftMargin - rightMargin, align: 'left' });

        lastY = pdfDoc.y;
      }

      pdfDoc
        .moveTo(leftMargin, pdfDoc.y)
        .lineTo(pageWidth - rightMargin, pdfDoc.y)
        .strokeColor('#AAAAAA')
        .stroke();

      pdfDoc.moveDown(1);
    };

    if (
      prescription?.history
      && prescription?.history.length !== 0
      && prescription?.history[0]
      && prescription?.history[0].length !== 0
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`History: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      const textX = pdfDoc.x + 20;
      const bulletX = pdfDoc.x + 17;
      prescription.history.forEach((sentence) => {
        if (sentence.trim()) {
          const textY = pdfDoc.y;

          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text('• ', bulletX, textY, { continued: true });

          pdfDoc.text(sentence.trim(), textX, textY, { align: 'left' });
          pdfDoc.moveDown(0.2);
        }
      });

      pdfDoc.moveDown(0.3);
    }

    if (
      prescription?.physicalExamination
      && prescription?.physicalExamination.length !== 0
      && prescription?.physicalExamination[0]
      && prescription?.physicalExamination[0].length !== 0
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Physical Examination: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      const textX = pdfDoc.x + 20;
      const bulletX = pdfDoc.x + 17;
      prescription.physicalExamination.forEach((sentence) => {
        if (sentence.trim()) {
          const textY = pdfDoc.y;

          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text('• ', bulletX, textY, { continued: true });

          pdfDoc.text(sentence.trim(), textX, textY, { align: 'left' });
          pdfDoc.moveDown(0.2);
        }
      });
      pdfDoc.moveDown(0.3);
    }

    if (
      prescription?.drugAllergy
      && prescription?.drugAllergy.length !== 0
      && prescription?.drugAllergy[0]
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Drug Allergy: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      prescription.drugAllergy.forEach((drug) => {
        if (drug.details) {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${drug?.name}:  ${drug?.details}`, { indent: 20 })
            .moveDown(0.2);
        } else {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${drug?.name}`, { indent: 20 })
            .moveDown(0.2);
        }
      });
      pdfDoc.moveDown(0.3);
    }

    if (
      prescription?.drugHistory
      && prescription?.drugHistory.length !== 0
      && prescription?.drugHistory[0]
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Drug History`, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      prescription.drugHistory.forEach((drug) => {
        if (drug.details) {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${drug?.name}:  ${drug?.details}`, { indent: 20 })
            .moveDown(0.2);
        } else {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${drug?.name}`, { indent: 20 })
            .moveDown(0.2);
        }
      });
      pdfDoc.moveDown(0.3);
    }

    if (
      prescription?.antiplatlet
      && prescription?.antiplatlet.length !== 0
      && prescription?.antiplatlet[0]
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`ANTIPLATELET/ANTICOAGULANT: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);
    
      prescription.antiplatlet.forEach((anti) => {
        if (anti.details) {
          pdfDoc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(
              `• ${anti?.name?.toUpperCase()}: ${anti?.details?.toUpperCase()}`,
              { indent: 20 }
            )
            .moveDown(0.2);
        } else {
          pdfDoc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(
              `• ${anti?.name?.toUpperCase()}`,
              { indent: 20 }
            )
            .moveDown(0.2);
        }
      });
      pdfDoc.moveDown(0.3);
    }

    addFieldStylish('Previous Surgery', `${prescription?.previousSurgery || ''}`);
    if (
      prescription?.diagnosis
      && prescription?.diagnosis.length !== 0
      && prescription?.diagnosis[0]
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Diagnosis: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      prescription.diagnosis.forEach((diagnosis) => {
        if (diagnosis.details) {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${diagnosis?.type}:  ${diagnosis?.details}`, { indent: 20 })
            .moveDown(0.2);
        } else {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${diagnosis?.type}`, { indent: 20 })
            .moveDown(0.2);
        }
      });
      pdfDoc.moveDown(0.3);
    }

    if (
      prescription?.implant
      && prescription?.implant.length !== 0
      && prescription?.implant[0]
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Implants: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      prescription.implant.forEach((implant) => {
        if (implant.removalDate) {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${implant?.name}, Removal Date:  ${formatDateToDDMMYYYY(implant?.removalDate)}`, { indent: 20 })
            .moveDown(0.2);
        } else {
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text(`• ${implant?.name}`, { indent: 20 })
            .moveDown(0.2);
        }
      });
      pdfDoc.moveDown(0.3);
    }

    if (
      prescription?.investigationsAdviced
      && prescription?.investigationsAdviced.length !== 0
      && prescription?.investigationsAdviced[0]
    ) {
      const leftMargin = pdfDoc.page.margins.left;
      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Investigation Advice: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

        prescription.investigationsAdviced.forEach((advice) => {
          if (advice.details) {
            pdfDoc
              .fontSize(10)
              .font('Helvetica')
              .text(`• ${advice?.name}, Details: ${advice?.details}`, { indent: 20 })
              .moveDown(0.2);
            } else {
              pdfDoc
                .fontSize(10)
                .font('Helvetica')
                .text(`• ${advice?.name}`, { indent: 20 })
                .moveDown(0.2);
            }
      });
      pdfDoc.moveDown(0.3);
    }

    pdfDoc.moveDown();
    if (
      prescription?.medications
      && prescription?.medications.length > 0
      && prescription?.medications[0]
    ) {
      prescription.medications.forEach((medicine, index) => {
        addMedicineEntry(index + 1, medicine);
      });
    }

    const today = new Date();
    const followUpDate = new Date(today || 0);
    followUpDate.setDate(today.getDate() + parseInt(prescription?.followUp.days, 10));

    if (prescription?.advice && prescription.advice.length > 0) {
      const leftMargin = pdfDoc.page.margins.left;

      if (pdfDoc.y + 20 > pdfDoc.page.height - pdfDoc.page.margins.bottom) {
        pdfDoc.addPage();
      }

      pdfDoc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Advice: `, leftMargin, pdfDoc.y)
        .moveDown(0.3);

      const textX = pdfDoc.x + 20;
      const bulletX = pdfDoc.x + 17;
      prescription.advice.forEach((sentence) => {
        if (sentence.trim()) {
          if (pdfDoc.y + 15 > pdfDoc.page.height - pdfDoc.page.margins.bottom) {
            pdfDoc.addPage();
          }

          const textY = pdfDoc.y;

          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text('• ', bulletX, textY, { continued: true });

          pdfDoc.text(sentence.trim(), textX, textY, { align: 'left' });
          pdfDoc.moveDown(0.2);
        }
      });
      pdfDoc.moveDown(0.2);
    }

    if (prescription?.surgeryAdvice?.date) {
      addFieldStylish('Surgery Advice', `${prescription?.surgeryAdvice?.name}, Date: ${formatDateToDDMMYYYY(prescription?.surgeryAdvice?.date)}`);
    } else {
      addFieldStylish('Surgery Advice', prescription?.surgeryAdvice?.name);
    }

    if (prescription?.followUp.days) {
      addFieldStylish('Follow Up Days', `${prescription?.followUp.days}, Date: (${followUpDate.toDateString()})`);
    }

    if (prescription?.referredBy?.speciality) {
      addFieldStylish('Referred By', `${prescription?.referredBy?.name} (${prescription?.referredBy?.speciality || ''})`);
    } else if (prescription?.referredBy?.name) {
      addFieldStylish('Referred By', `${prescription?.referredBy?.name}`);
    }

    if (prescription?.referredTo && prescription?.referredTo.length > 0) {
      const leftMargin = pdfDoc.page.margins.left;

      pdfDoc
        .moveDown(0.5)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Referred To:', leftMargin, pdfDoc.y)
        .moveDown(0.3);

      const textX = pdfDoc.x + 20;
      const bulletX = pdfDoc.x + 17;

      prescription.referredTo.forEach((data) => {
        if (data?.name) {
          let referralText = data.speciality
            ? `${data.name} (${data.speciality})`
            : `${data.name}`;

          if (pdfDoc.y + 15 > pdfDoc.page.height - pdfDoc.page.margins.bottom) {
            pdfDoc.addPage();
          }

          const textY = pdfDoc.y;
          pdfDoc
            .fontSize(10)
            .font('Helvetica')
            .text('• ', bulletX, textY, { continued: true });

          pdfDoc.text(referralText, textX, textY, { align: 'left' });
          pdfDoc.moveDown(0.2);
        }
      });

      pdfDoc.moveDown(0.3);
    }

    pdfDoc.end();
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', (err) => reject(err));
  });
};

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    const addFieldStylish = (label, value) => {
      if (value) {
        const leftMargin = pdfDoc.page.margins.left;
        pdfDoc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(`${label}:`, leftMargin, pdfDoc.y, { continued: true })
          .font('Helvetica')
          .text(` ${value}`)
          .moveDown(0.5);
      }
    };

    const addInvoiceEntry = (index, invoice) => {
      const pageWidth = pdfDoc.page.width;
      const leftMargin = pdfDoc.page.margins.left;
      const rightMargin = pdfDoc.page.margins.right;
      const columnWidth = (pageWidth - leftMargin - rightMargin) / 6;

      if (index === 1) {
        pdfDoc
          .moveTo(leftMargin, pdfDoc.y)
          .lineTo(pageWidth - rightMargin, pdfDoc.y)
          .strokeColor('#AAAAAA')
          .stroke();

        pdfDoc.moveDown(0.5);

        pdfDoc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Service Type', leftMargin, pdfDoc.y, { width: columnWidth, align: 'left' })
          .text('Quantity', leftMargin + columnWidth * 2, pdfDoc.y-14, { width: columnWidth, align: 'center' })
          .text('Unit Price', leftMargin + columnWidth * 3, pdfDoc.y-14, { width: columnWidth, align: 'center' })
          .text('Discount', leftMargin + columnWidth * 4, pdfDoc.y-14, { width: columnWidth, align: 'center' })
          .text('Total', leftMargin + columnWidth * 5, pdfDoc.y-14, { width: columnWidth, align: 'center' });

        pdfDoc.moveDown(0.5);
        const underlineY = pdfDoc.y;
        pdfDoc
          .moveTo(leftMargin, underlineY)
          .lineTo(pageWidth - rightMargin, underlineY)
          .strokeColor('#AAAAAA')
          .stroke();

        pdfDoc.moveDown(1);
      }

      const totalAmount = parseInt(invoice.amount) * parseInt(invoice.quantity) - parseInt(invoice.discount);

      pdfDoc
        .fontSize(12)
        .font('Helvetica')
        .text(`${index}) ${invoice.service}`, leftMargin, pdfDoc.y, { width: columnWidth, align: 'left' })
        .text(invoice.quantity, leftMargin + columnWidth * 2, pdfDoc.y - 14, { width: columnWidth, align: 'center' })
        .text(invoice.amount, leftMargin + columnWidth * 3, pdfDoc.y - 14, { width: columnWidth, align: 'center' })
        .text(invoice.discount, leftMargin + columnWidth * 4, pdfDoc.y - 14, { width: columnWidth, align: 'center' })
        .text(totalAmount, leftMargin + columnWidth * 5, pdfDoc.y - 14, { width: columnWidth, align: 'center' });

      const underlineY = pdfDoc.y;
      pdfDoc
        .moveTo(leftMargin, underlineY)
        .lineTo(pageWidth - rightMargin, underlineY)
        .strokeColor('#AAAAAA')
        .stroke();

      pdfDoc.moveDown(1);
    };

    const pdfDoc = new PDFDocument({ margin: 30 });
    pdfDoc.moveDown(10);

    const publicFolder = path.join(__dirname, '../public', 'invoices');
    const fileName = `invoice_${invoice._id}.pdf`;
    const filePath = path.join(publicFolder, fileName);

    // Ensure the public folder exists
    if (!fs.existsSync(publicFolder)) {
      fs.mkdirSync(publicFolder, { recursive: true });
    }

    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);

    const pageWidth = pdfDoc.page.width;
    const leftMargin = pdfDoc.page.margins.left;
    const rightMargin = pdfDoc.page.margins.right;

    const createdAtDate = new Date();
    const rightText = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(createdAtDate);
    const rightTextWidth = pdfDoc.widthOfString(rightText);
    const currentY = pdfDoc.y;

    pdfDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Billed To: ', leftMargin, currentY)
      .font('Helvetica')
      .text(rightText, pageWidth - rightMargin - rightTextWidth - 300, currentY, { align: 'right' })
      .moveDown(0.5);

    pdfDoc
      .fontSize(12)
      .font('Helvetica')
      .text(invoice.name, leftMargin, pdfDoc.y);

    pdfDoc
      .fontSize(12)
      .font('Helvetica')
      .text(invoice.phone, leftMargin, pdfDoc.y)
      .moveDown(1);

    addFieldStylish('Payment Status', invoice.paymentStatus);
    addFieldStylish('Payment Mode', invoice.paymentMode);
    addFieldStylish('Patient Note', invoice.patientNote);
    pdfDoc.moveDown();

    let subTotal = 0;
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach((invoice, index) => {
        if (invoice.quantity && invoice.amount) {
          subTotal += parseInt(invoice.amount) * parseInt(invoice.quantity) - parseInt(invoice.discount);
          addInvoiceEntry(index + 1, invoice);
        }
      });
    } else {
      pdfDoc
        .fontSize(12)
        .font('Helvetica')
        .text('No medicines prescribed.')
        .moveDown(1);
    }

    const rm = pdfDoc.page.margins.right;
    pdfDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Subtotal: ', rm + 390, pdfDoc.y, { continued: true })
      .font('Helvetica')
      .text(subTotal, rm + 438, pdfDoc.y)
      .moveDown(0.5);

    pdfDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Additional Discount: ', rm + 325, pdfDoc.y, { continued: true })
      .font('Helvetica')
      .text(invoice.additionalDiscountAmount, rm + 373, pdfDoc.y)
      .moveDown(0.5);

    pdfDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('Total Amount: ', rm + 362, pdfDoc.y, { continued: true })
      .font('Helvetica')
      .text(subTotal - parseInt(invoice.additionalDiscountAmount), rm + 410, pdfDoc.y)
      .moveDown(0.5);

    pdfDoc.end();
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', (err) => reject(err));
  });
};

module.exports = {
  generatePrescriptionPDF,
  generateInvoicePDF,
};
