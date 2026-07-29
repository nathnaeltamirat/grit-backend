import z from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid Email')),
  password: z.string().min(8, 'Weak password'),
});

export const registerSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, 'Name is too short')
    .refine((val) => val.split(' ').filter(Boolean).length == 2, {
      message: 'Please enter your first and last name',
    }),
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid Email')),
  password: z.string().min(8, 'Weak password'),
});
