import type { Request, Response } from 'express';
import { createStoreOwnerSchema } from '../schema/admin.schema.ts';
import * as adminServices from '../services/admin.service.ts';

export const createStoreOwner = async (req: Request, res: Response) => {
    try {
        const result = createStoreOwnerSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues[0]?.message, error: result.error })
        }
        await adminServices.createStoreOwnerFeature(result.data)
        res.status(201).json({ message: 'Store owner created successfully' })
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Phone number or email already in use' })
        }
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const deleteStoreOwner = async (req: Request, res: Response) => {
    try {
        const  id  = req.params.id as string
        await adminServices.deleteStoreOwnerFeature(id)
        res.status(200).json({ message: 'Store owner deleted successfully' })
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await adminServices.getAllUsersFeature()
        res.status(200).json(users)
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}

export const getAllStoreOwners = async (req: Request, res: Response) => {
    try {
        const storeOwners = await adminServices.getAllStoreOwnersFeature()
        res.status(200).json(storeOwners)
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}
