import Joi from 'joi';

// Password validation with Joi
export const validatePassword = (password: string): boolean | string => {
  const passwordSchema = Joi.string()
    .min(8)
    .pattern(/[A-Z]/, 'uppercase letter')  // Check for at least one uppercase letter
    .pattern(/[!@#$%^&*(),.?":{}|<>]/, 'special character')  // Check for special character
    .pattern(/\d/, 'number')  // Check for at least one number
    .required();

  const { error } = passwordSchema.validate(password);

  if (error) {
    return error.details[0].message; // Return the validation error message
  }

  return true; // Password is valid
};

// Email validation with Joi
export const validateEmail = (email: string): boolean | string => {
  const emailSchema = Joi.string()
    .email({ tlds: { allow: false } }) // Optionally, block non-standard TLDs
    .required(); // Ensure the email is required

  const { error } = emailSchema.validate(email);

  if (error) {
    return 'Invalid email format'; // Return the error message
  }

  return true; // Email is valid
};
