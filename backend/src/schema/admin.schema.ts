import * as z from 'zod';
import { passwordRules, optionalEmail } from './user.schema.ts';

export const createStoreOwnerSchema = z.object({
    name: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().length(8, "phone number either larger then 8 or lower then 8"),
    email: optionalEmail,
    password: passwordRules
})

export type CreateStoreOwnerData = z.infer<typeof createStoreOwnerSchema>;
