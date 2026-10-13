import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { storeOwnerMiddleware } from '../middleware/user.middleware.ts';
import { uploadImage } from '../controller/upload.controller.ts';
import { allowedImageTypes } from '../services/upload.service.ts';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Only JPEG, PNG, WebP or GIF images are allowed'))
        }
    },
});

const singleImage = (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, (error: unknown) => {
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message })
        }
        next()
    })
}

router.post('/', storeOwnerMiddleware, singleImage, uploadImage);

export default router;
