const Invoice = require('../models/invoice');
const { generateInvoiceId } = require('../utils/helpers');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { validateInvoice, validateInvoiceUpdate } = require('../validations/invoice.validation');
const xlsx = require('xlsx');

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

    // Use update validation for partial updates
    const invoiceValidation = validateInvoiceUpdate(invoiceData);
    if (!invoiceValidation.success) {
      return {
        statusCode: 400,
        error: invoiceValidation.errors,
      };
    }

    // Build update object with only provided fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (uid !== undefined) updateFields.uid = uid;
    if (phone !== undefined) updateFields.phone = phone;
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
    if (privateNote !== undefined) updateFields.privateNote = privateNote;
    if (items !== undefined) updateFields.items = items;
    if (additionalDiscountAmount !== undefined) updateFields.additionalDiscountAmount = additionalDiscountAmount;
    if (totalAmount !== undefined) updateFields.totalAmount = totalAmount;
    if (paymentMode !== undefined) updateFields.paymentMode = paymentMode;
    if (patientNote !== undefined) updateFields.patientNote = patientNote;

    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, doctorId },
      updateFields,
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

const exportInvoices = async (doctorId, options) => {
  try {
    const { format = 'csv', dateRange, statusFilter, modeFilter, searchQuery } = options;

    // Build query based on filters
    let query = { doctorId };
    
    if (statusFilter && statusFilter !== 'All') {
      query.paymentStatus = statusFilter;
    }
    
    if (modeFilter && modeFilter !== 'All') {
      query.paymentMode = modeFilter;
    }

    // Apply date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Apply search filter
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { uid: { $regex: searchQuery, $options: 'i' } },
        { invoiceId: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });

    // Transform data for export
    const exportData = invoices.map(invoice => ({
      'Invoice ID': invoice.invoiceId,
      'Patient Name': invoice.name,
      'UID': invoice.uid,
      'Phone': invoice.phone,
      'Date': invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '',
      'Amount (₹)': invoice.totalAmount,
      'Status': invoice.paymentStatus,
      'Payment Mode': invoice.paymentMode,
      'Private Notes': invoice.privateNote || '',
      'Patient Notes': invoice.patientNote || '',
      'Additional Discount': invoice.additionalDiscountAmount || 0,
      'Services': invoice.items ? invoice.items.map(item => 
        `${item.service} (Qty: ${item.quantity}, Amount: ₹${item.amount}, Discount: ₹${item.discount})`
      ).join('; ') : ''
    }));

    let data, contentType, filename;

    if (format === 'xlsx') {
      // Create Excel workbook
      const workbook = xlsx.utils.book_new();
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Invoices');
      
      // Generate buffer
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return {
        statusCode: 200,
        data: buffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
    } else if (format === 'csv') {
      // Create CSV
      const worksheet = xlsx.utils.json_to_sheet(exportData);
      const csv = xlsx.utils.sheet_to_csv(worksheet);
      
      return {
        statusCode: 200,
        data: csv,
        contentType: 'text/csv'
      };
    } else {
      return {
        statusCode: 400,
        error: 'Unsupported export format'
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      error: error.message
    };
  }
};

module.exports = {
  createInvoice,
  getInvoicesByDoctorId,
  getInvoiceById,
  updateInvoice,
  deleteInvoiceById,
  printInvoice,
  exportInvoices,
};
