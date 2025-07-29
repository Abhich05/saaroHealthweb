const zod = require('zod');

const DoctorValidationSchema = zod.object({
  name: zod
    .string()
    .min(3, { message: 'Name must have at least 3 characters.' })
    .trim(),
  rmcNumber: zod
    .string()
    .min(1, { message: 'RMC Number is required.' })
    .trim(),
  phoneNumber: zod
    .string()
    .regex(/^\d{10}$/, { message: 'Phone number must be a valid 10-digit number.' }),
  email: zod
    .string()
    .email({ message: 'Email must be a valid email address.' })
    .trim(),
  address: zod
    .string()
    .min(5, { message: 'Address must have at least 5 characters.' })
    .trim(),
  clinicName: zod
    .string()
    .optional(),
  password: zod
    .string()
    .min(8, { message: 'Password must have at least 8 characters.' }),
});

const validateDoctor = (doctorData) => {
  const validationResult = DoctorValidationSchema.safeParse(doctorData);

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

module.exports = validateDoctor;
