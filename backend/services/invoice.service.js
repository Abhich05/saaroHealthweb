const Invoice = require('../models/invoice');
const { generateInvoiceId } = require('../utils/helpers');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { validateInvoice } = require('../validations/invoice.validation');

const createInvoice = async ( doctorId, invoiceData, invoiceId ) => {
  try {
    const {
      name,
      uid,
      phone,
      paymentStatus,
      privateNote,
      items,
      additionalDiscountAmount,
      totalAmount,
      paymentMode,
      patientNote,
    } = invoiceData;

    const invoiceValidation = validateInvoice(invoiceData);
    if (!invoiceValidation.success) {
      return {
        statusCode: 400,
        error: invoiceValidation.errors,
      };
    }

    let invoice;
    if (invoiceId) {
      invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        {
          doctorId,
          name,
          uid,
          phone,
          paymentStatus,
          privateNote,
          items,
          additionalDiscountAmount,
          totalAmount,
          paymentMode,
          patientNote,
        },
        { new: true },
      );

      if (!invoice) {
        return {
          statusCode: 404,
          error: 'Invoice not found',
        };
      }
    } else {
      const invoiceId = await generateInvoiceId();
      invoice = new Invoice({
        doctorId,
        name,
        uid,
        invoiceId,
        phone,
        paymentStatus,
        privateNote,
        items,
        additionalDiscountAmount,
        totalAmount,
        paymentMode,
        patientNote,
      });
      await invoice.save();
    }
    await generateInvoicePDF(invoice);

    return {
      statusCode: 201,
      invoice,
      invoiceUrl: `${process.env.SERVER_URL}/public/invoices/invoice_${invoice._id}.pdf`,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getInvoicesByDoctorId = async (doctorId, page = 1, limit = 7) => {
  try {
    const query = { doctorId };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Invoice.countDocuments(query),
    ]);
    return {
      statusCode: 200,
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const getInvoiceById = async (invoiceId, doctorId) => {
  try {
    const invoice = await Invoice.findOne({ _id: invoiceId, doctorId });

    if (!invoice) {
      return {
        statusCode: 404,
        error: `Invoice with Id ${invoiceId} not found`,
      };
    }

    return {
      statusCode: 200,
      invoice: invoice,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const updateInvoice = async (invoiceId, doctorId, invoiceData) => {
  try {
    const {
      name,
      uid,
      phone,
      paymentStatus,
      privateNote,
      items,
      additionalDiscountAmount,
      totalAmount,
      paymentMode,
      patientNote,
    } = invoiceData;

    const invoiceValidation = validateInvoice(invoiceData);
    if (!invoiceValidation.success) {
      return {
        statusCode: 400,
        error: invoiceValidation.errors,
      };
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, doctorId },
      {
        name,
        uid,
        phone,
        paymentStatus,
        privateNote,
        items,
        additionalDiscountAmount,
        totalAmount,
        paymentMode,
        patientNote,
      },
      { new: true },
    );

    if (!invoice) {
      return {
        statusCode: 404,
        error: 'Invoice not found',
      };
    }

    // Regenerate PDF after update
    await generateInvoicePDF(invoice);

    return {
      statusCode: 200,
      invoice,
      invoiceUrl: `${process.env.SERVER_URL}/public/invoices/invoice_${invoice._id}.pdf`,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

const deleteInvoiceById = async (invoiceId, doctorId) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: invoiceId, doctorId });

    if (!invoice) {
      return {
        statusCode: 404,
        error: 'Invoice not found',
      };
    }

    return {
      statusCode: 200,
      invoice: invoice,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

// New function to print invoice
const printInvoice = async (invoiceId, doctorId) => {
  try {
    const invoice = await Invoice.findOne({ _id: invoiceId, doctorId });

    if (!invoice) {
      return {
        statusCode: 404,
        error: 'Invoice not found',
      };
    }

    // Generate or regenerate PDF
    await generateInvoicePDF(invoice);

    return {
      statusCode: 200,
      invoice,
      pdfUrl: `${process.env.SERVER_URL}/public/invoices/invoice_${invoice._id}.pdf`,
    };
  } catch (error) {
    return {
      statusCode: 500,
      error: error,
    };
  }
}

module.exports = {
  createInvoice,
  getInvoicesByDoctorId,
  getInvoiceById,
  updateInvoice,
  deleteInvoiceById,
  printInvoice,
};
