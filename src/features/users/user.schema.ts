import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .refine((value) => !/\s/.test(value), 'Password must not contain spaces');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters').max(120),
  email: z.string().trim().toLowerCase().email('Email must be a valid address'),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email must be a valid address'),
  password: z.string().min(1, 'Password is required'),
});

export { loginSchema, registerSchema };
