import { z } from 'zod';

const baseUserSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

export const userValidation = {
  register: z.object({
    body: baseUserSchema.extend({
      password: z.string().min(6, 'Password must be at least 6 characters long'),
    }),
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Please provide a valid email'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),

  updateProfile: z.object({
    body: baseUserSchema
      .extend({
        password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
      })
      .partial(),
  }),
};
