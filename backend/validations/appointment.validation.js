const zod = require('zod');

const AppointmentValidationSchema = zod.object({
  date: zod
    .string({ message: 'Date is required and should be a valid date.' }),
  location: zod
    .string()
    .min(1, { message: 'Location is required.' })
    .trim(),
  time: zod
    .string()
    .min(1, { message: 'Time is required.' })
    .regex(/^([01]?[0-9]|12):([0-5][0-9]) (AM|PM)$/i, { message: 'Time must be in the format hh:mm AM/PM.' })
    .trim(),
  type: zod
    .string()
    .min(1, { message: 'Type is required.' })
    .trim(),
});

const validateAppointment = (appointmentData) => {
  const validationResult = AppointmentValidationSchema.safeParse(appointmentData);

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: err.path[0],
      message: err.message,
    }));

    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: validationResult.data,
  };
};

module.exports = validateAppointment;
