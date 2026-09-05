import z from 'zod';

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, 'Name is too short')
    .refine((val) => val.split(' ').filter(Boolean).length == 2, {
      message: 'Please enter your first and last name',
    })
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email('Invalid email'))
    .optional(),
});

export const updatePasswordSchema = z.object({
  old_password: z.string().min(8, 'Weak password'),
  new_password: z.string().min(8, 'Weak password'),
  confirm_password: z.string().min(8, 'Weak password'),
});
