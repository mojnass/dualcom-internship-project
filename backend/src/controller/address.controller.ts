import type { Request, Response } from 'express';
import { addressSchema } from '../schema/address.schema.ts';
import * as addressServices from '../services/address.service.ts';

export const createAddress = async (req: Request, res: Response) => {
    try {
        const result = addressSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0]?.message, error: result.error })
        }
        const userId = req.userId as string
        const address = await addressServices.createAddressFeature(userId, result.data);
        res.status(201).json(address)
    } catch (error: any) {
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const getOwnAddresses = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string
        const addresses = await addressServices.getOwnAddressesFeature(userId);
        res.status(200).json(addresses)
    } catch (error: any) {
        res.status(500).json({ message: "Something went wrong" })
    }
}

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const userId = req.userId as string
        await addressServices.deleteAddressFeature(userId, req.params.id as string);
        res.status(200).json({ message: "Address deleted" })
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}
