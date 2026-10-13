import type { Request, Response } from 'express';
import { createOrderSchema, updateOrderStatusSchema } from '../schema/order.schema.ts';
import * as orderServices from '../services/order.service.ts';

export const createOrder = async (req: Request, res: Response) => {
    try {
        const result = createOrderSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0]?.message, error: result.error })
        }
        const orders = await orderServices.createOrderFeature(req.userId as string, result.data)
        res.status(201).json(orders)
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const getOwnOrders = async (req: Request, res: Response) => {
    try {
        const orders = await orderServices.getOwnOrdersFeature(req.userId as string)
        res.status(200).json(orders)
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const getStoreOrders = async (req: Request, res: Response) => {
    try {
        const orders = await orderServices.getStoreOrdersFeature(req.userId as string)
        res.status(200).json(orders)
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const result = updateOrderStatusSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0]?.message, error: result.error })
        }
        const order = await orderServices.updateOrderStatusFeature(
            req.userId as string,
            req.params.id as string,
            result.data
        )
        res.status(200).json(order)
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}
