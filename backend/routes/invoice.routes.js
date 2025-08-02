const express = require('express');
const invoice = express.Router({ mergeParams: true });
const invoiceController = require('../controllers/invoice.controller');

invoice.post('/:invoiceId?', invoiceController.createInvoice);
invoice.get('/', invoiceController.getInvoicesByDoctorId);
invoice.put('/:invoiceId', invoiceController.updateInvoice);
invoice.get('/:invoiceId', invoiceController.getInvoiceById);
invoice.delete('/:invoiceId', invoiceController.deleteInvoiceById);
invoice.get('/:invoiceId/print', invoiceController.printInvoice);

module.exports = invoice;
