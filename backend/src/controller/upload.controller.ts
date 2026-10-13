import type { Request, Response } from 'express';
import * as uploadServices from '../services/upload.service.ts';

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image provided' })
        }
        const url = await uploadServices.uploadImageFeature(req.file)
        res.status(201).json({ url })
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message })
        } else {
            res.status(500).json({ message: 'Something went wrong' })
        }
    }
}
