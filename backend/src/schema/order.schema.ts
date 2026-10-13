import * as z from 'zod';

const orderItemSchema = z.object({
    product: z.string(),
    size: z.string().min(1, "size is required"),
    quantity: z.number().int().positive()
});

export const createOrderSchema = z.object({
    items: z.array(orderItemSchema).min(1, "cart is empty"),
    paymentMethod: z.enum(['cash', 'card']),
    addressId: z.string()
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(['accepted', 'rejected', 'delivered']),
    rejectionReason: z.string().max(200).optional()
});

export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;
