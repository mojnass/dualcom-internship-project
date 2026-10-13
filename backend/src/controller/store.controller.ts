import type { Request, Response } from 'express';
import { storeSchema, updateStoreSchema } from '../schema/store.schema.ts';
import * as storeServices from '../services/store.service.ts';


export const getAllStores = async (req: Request, res: Response) => {
    try {
        const stores = await storeServices.getAllStoresFeature()
        res.status(200).json(stores)
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}

export const getStoreById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const store = await storeServices.getStoreByIdFeature(id)
        res.status(200).json(store)
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}

export const createStore = async (req: Request, res: Response) => {
    try {
        const ownerId = req.userId as string
        const result = storeSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ error: result.error })
        }
        const store = await storeServices.createStoreFeature(ownerId, result.data)
        res.status(201).json({ message: 'Store created successfully', store })
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Store already exists' })
        }
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message })
        }
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const updateOwnStore = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const ownerId = req.userId as string
        const result = updateStoreSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ error: result.error })
        }
        const store = await storeServices.updateOwnStoreFeature(id, ownerId, result.data)
        res.status(200).json({ message: 'Store updated successfully', store })
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}

export const deleteOwnStore = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const ownerId = req.userId as string
        await storeServices.deleteOwnStoreFeature(id, ownerId)
        res.status(200).json({ message: 'Store deleted successfully' })
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}
