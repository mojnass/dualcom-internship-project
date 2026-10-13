import * as z from 'zod';

const sizeStockSchema = z.object({
    size: z.string().trim().min(1, "size is required"),
    quantity: z.number().int().min(0, "quantity cannot be negative"),
})

const sizesSchema = z.array(sizeStockSchema)
    .min(1, "add at least one size")
    .refine((sizes) => new Set(sizes.map((s) => s.size)).size === sizes.length, "each size can only be listed once")

export const productSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    image: z.url().optional(),
    category: z.string(),
    gender: z.enum(['men', 'women']),
    sizes: sizesSchema,
})

export const updateProductSchema = productSchema.partial()

export type ProductData = z.infer<typeof productSchema>;
export type UpdateProductData = z.infer<typeof updateProductSchema>;
