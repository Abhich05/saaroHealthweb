const invoiceService = require('../services/invoice.service');

const createInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    const { doctorId, invoiceId } = req.params;

    const invoice = await invoiceService.createInvoice(doctorId, invoiceData, invoiceId);
    if (invoice?.error) {
      return res
        .status(invoice.statusCode)
        .send(invoice.error);
    }

    res
      .status(invoice.statusCode)
      .json({
        invoice: invoice.invoice,
        invoiceUrl: invoice.invoiceUrl,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getInvoicesByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 7 } = req.query;
    const invoice = await invoiceService.getInvoicesByDoctorId(doctorId, page, limit);
    if (invoice?.error) {
      return res
        .status(invoice.statusCode)
        .send(invoice.error);
    }
    res
      .status(invoice.statusCode)
      .json({
        invoices: invoice.invoices,
        pagination: invoice.pagination,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId, doctorId } = req.params;

    const invoice = await invoiceService.getInvoiceById(invoiceId, doctorId);
    if (invoice?.error) {
      return res
        .status(invoice.statusCode)
        .send(invoice.error);
    }

    res
      .status(invoice.statusCode)
      .json({
        invoice: invoice.invoice,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const updateInvoice = async (req, res) => {
  try {
    const { invoiceId, doctorId } = req.params;
    const invoiceData = req.body;

    const invoice = await invoiceService.updateInvoice(invoiceId, doctorId, invoiceData);
    if (invoice?.error) {
      return res
        .status(invoice.statusCode)
        .send(invoice.error);
    }

    res
      .status(invoice.statusCode)
      .json({
        invoice: invoice.invoice,
        invoiceUrl: invoice.invoiceUrl,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

const deleteInvoiceById = async (req, res) => {
  try {
    const { invoiceId, doctorId } = req.params;

    const invoice = await invoiceService.deleteInvoiceById(invoiceId, doctorId);
    if (invoice?.error) {
      return res
        .status(invoice.statusCode)
        .send(invoice.error);
    }

    res
      .status(invoice.statusCode)
      .json({
        invoice: invoice.invoice,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

// New function to print invoice
const printInvoice = async (req, res) => {
  try {
    const { invoiceId, doctorId } = req.params;

    const result = await invoiceService.printInvoice(invoiceId, doctorId);
    if (result?.error) {
      return res
        .status(result.statusCode)
        .send(result.error);
    }

    res
      .status(result.statusCode)
      .json({
        invoice: result.invoice,
        pdfUrl: result.pdfUrl,
      });
  } catch(error) {
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

// Export invoices function
const exportInvoices = async (req, res) => {
  try {
    console.log('Export invoices controller called with params:', req.params);
    console.log('Export invoices controller called with query:', req.query);
    const { doctorId } = req.params;
    const { format = 'csv', dateRange, statusFilter, modeFilter, searchQuery } = req.query;

    const result = await invoiceService.exportInvoices(doctorId, {
      format,
      dateRange,
      statusFilter,
      modeFilter,
      searchQuery
    });

    if (result?.error) {
      return res
        .status(result.statusCode)
        .send(result.error);
    }

    // Set appropriate headers for file download
    const filename = `invoices_${new Date().toISOString().split('T')[0]}.${format}`;
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res
      .status(result.statusCode)
      .send(result.data);
  } catch(error) {
    console.error('Export invoices controller error:', error);
    res
      .status(500)
      .send(`Error: ${error}`);
  }
}

module.exports = {
  createInvoice,
  getInvoicesByDoctorId,
  getInvoiceById,
  updateInvoice,
  deleteInvoiceById,
  printInvoice,
  exportInvoices,
};
