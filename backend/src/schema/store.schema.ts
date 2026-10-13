import * as z from 'zod';

export const storeSchema = z.object({
    name: z.string(),
    location: z.string().optional(),
    logo: z.url().optional(),
    category: z.enum(['men', 'women', 'men & women']),
})

export const updateStoreSchema = storeSchema.partial()

export type StoreData = z.infer<typeof storeSchema>;
export type UpdateStoreData = z.infer<typeof updateStoreSchema>;
