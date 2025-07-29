const zod = require('zod');

const nameSchema = zod.string().min(3);
const emailSchema = zod.string().email();
const passwordSchema = zod.string().min(8);

const validateUser = (userData) => {
  const { name, email, password, confirmPassword } = userData;

  if (
    !email
    || !password
  ) {
    return {
      error: 'Please fill all the fields',
    };
  }

  if (password !== confirmPassword) {
    return {
      error: `Confirm Password doesn't match with Password`,
    };
  }

  const nameValidation = nameSchema.safeParse(name);
  if (name && !nameValidation.success) {
    return {
      error: 'User name is not valid, it must have a length of 3 characters',
    };
  }

  const emailValidation = emailSchema.safeParse(email);
  if (!emailValidation.success) {
    return {
      error: 'Email is not valid, Please enter a valid email address',
    };
  }

  const passwordValidation = passwordSchema.safeParse(password);
  if (!passwordValidation.success) {
    return {
      error: 'Password is not valid, it must have a length of 8 characters or more',
    };
  }

  // If all validations pass, return success
  return { success: true };
}

module.exports = {
  validateUser,
};
