import * as z from 'zod';

export const passwordRules = z.string()
    .min(8, "password must be at least 8 characters")
    .max(64, "password must be at most 64 characters")
    .regex(/[A-Z]/, "password must contain an uppercase letter")
    .regex(/[a-z]/, "password must contain a lowercase letter")
    .regex(/[0-9]/, "password must contain a number")
    .regex(/[^A-Za-z0-9]/, "password must contain a symbol");

export const optionalEmail = z.email().optional().or(z.literal(''));

export const registerSchema = z.object({
   name: z.string(),
   lastName: z.string(),
   phoneNumber: z.string().length(8,"phone number either larger then 8 or lower then 8"),
   email: optionalEmail,
   password: passwordRules
});

export const loginSchema = z.object({
    identifier: z.union([z.email(),z.string().length(8)]),
    password: z.string()
})

export const updateProfileSchema = z.object({
    email: optionalEmail
});

export const changePasswordSchema = z.object({
    currentPassword: z.string(),
    newPassword: passwordRules
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
