import type { Request, Response } from 'express';
import { productSchema, updateProductSchema } from '../schema/product.schema.ts';
import * as productServices from '../services/product.service.ts';


export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productServices.getAllProductsFeature()
        res.status(200).json(products)
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}

export const getProductById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const product = await productServices.getProductByIdFeature(id)
        res.status(200).json(product)
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        const ownerId = req.userId as string
        const storeId = req.params.storeId as string
        const result = productSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ error: result.error })
        }
        const product = await productServices.createProductFeature(storeId, ownerId, result.data)
        res.status(201).json({ message: 'Product created successfully', product })
    } catch (error: any) {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message })
        }
        res.status(500).json({ message: 'Something went wrong' })
    }
}

export const updateOwnProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const ownerId = req.userId as string
        const result = updateProductSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({ error: result.error })
        }
        const product = await productServices.updateOwnProductFeature(id, ownerId, result.data)
        res.status(200).json({ message: 'Product updated successfully', product })
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}

export const deleteOwnProduct = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string
        const ownerId = req.userId as string
        await productServices.deleteOwnProductFeature(id, ownerId)
        res.status(200).json({ message: 'Product deleted successfully' })
    } catch (error: any) {
  if (error instanceof Error) {
            res.status(400).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }    }
}
