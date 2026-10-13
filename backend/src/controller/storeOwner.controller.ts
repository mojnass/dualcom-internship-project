import type { Request, Response } from 'express';
import * as storeOwnerServices from '../services/storeOwner.service.ts';

export const getOwnProfile = async (req: Request, res: Response) => {
    try {
        const ownerId = req.userId as string
        const profile = await storeOwnerServices.getOwnProfileFeature(ownerId)
        res.status(200).json(profile)
    } catch (error: any) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }
    }
}

export const getOwnStores = async (req: Request, res: Response) => {
    try {
        const ownerId = req.userId as string
        const stores = await storeOwnerServices.getOwnStoresFeature(ownerId)
        res.status(200).json(stores)
    } catch (error: any) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }
    }
}
