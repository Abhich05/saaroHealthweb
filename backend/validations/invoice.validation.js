const zod = require('zod');

const ItemSchema = zod.object({
  service: zod.string().nullable().optional(),
  amount: zod.number().min(0, { message: 'Amount must be at least 0.' }),
  quantity: zod.number().min(0, { message: 'Amount must be at least 0.' }),
  discount: zod.number().min(0, { message: 'Amount must be at least 0.' }),
});

const InvoiceSchema = zod.object({
  name: zod
    .string()
    .min(1, { message: 'Name is required.' })
    .trim(),
  uid: zod
    .string()
    .min(1, { message: 'UID is required.' })
    .trim(),
  phone: zod
    .string()
    .regex(/^\d{10}$/, { message: 'Phone number must be a 10-digit number.' }),
  paymentStatus: zod
    .string()
    .default('Unbilled')
    .optional(),
  privateNote: zod.string().optional(),
  items: zod
    .array(ItemSchema)
    .min(1, { message: 'At least one item is required.' }),
  additionalDiscountAmount: zod
    .number()
    .min(0, { message: 'Discount amount cannot be negative.' })
    .optional(),
  totalAmount: zod
    .number()
    .min(0, { message: 'Total amount must be at least 0.' }),
  paymentMode: zod
    .string()
    .default('Cash')
    .optional(),
  patientNote: zod.string().optional(),
});

const validateInvoice = (invoiceData) => {
  const result = InvoiceSchema.safeParse(invoiceData);

  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};

module.exports = {
  validateInvoice,
};
