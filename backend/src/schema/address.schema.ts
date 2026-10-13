import * as z from 'zod';

export const addressSchema = z.object({
    label: z.string().min(1, "label is required"),
    fullAddress: z.string().min(1, "address is required"),
    building: z.string().optional(),
    floor: z.string().optional(),
    apartment: z.string().optional(),
    notes: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
})

export type AddressData = z.infer<typeof addressSchema>;
