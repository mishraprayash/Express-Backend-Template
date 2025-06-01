import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

const settingsSchema = z.record(z.union([z.string(), z.boolean(), z.undefined()]));

export const userValidation = {
  register: z.object({
    body: userSchema,
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  updateProfile: z.object({
    body: z.object({
      email: z.string().email('Invalid email address').optional(),
      password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
      firstName: z.string().min(1, 'First name is required').optional(),
      lastName: z.string().min(1, 'Last name is required').optional(),
    }),
  }),

  updateSettings: z.object({
    body: z.object({
      settings: settingsSchema,
    }),
  }),
};
