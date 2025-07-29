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
    const { invoiceId } = req.params;

    const invoice = await invoiceService.getInvoiceById(invoiceId);
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

const deleteInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await invoiceService.deleteInvoiceById(invoiceId);
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

module.exports = {
  createInvoice,
  getInvoicesByDoctorId,
  getInvoiceById,
  deleteInvoiceById,
};
