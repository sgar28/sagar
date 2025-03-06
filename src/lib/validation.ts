import { z } from 'zod';

export const userValidationSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .regex(/^[A-Z][a-zA-Z]*$/, 'First letter must be capital'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .regex(/^[A-Z][a-zA-Z]*$/, 'First letter must be capital'),
  email: z.string()
    .email('Invalid email address'),
  phone: z.string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  age: z.number()
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Invalid age'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});

export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '').slice(0, 10);
};

export const validateAge = (age: number): boolean => {
  return age >= 18 && age <= 120;
};

export const validatePassword = (password: string): {
  isValid: boolean;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const isValid = Object.values(requirements).every(Boolean);

  return {
    isValid,
    requirements,
  };
}; 