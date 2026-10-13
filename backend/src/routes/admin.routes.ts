import { Router } from 'express';
import { adminMiddleware } from '../middleware/user.middleware.ts';
import {
    createStoreOwner,
    deleteStoreOwner,
    getAllUsers,
    getAllStoreOwners
} from '../controller/admin.controller.ts';

const router = Router();


router.post('/store-owner', adminMiddleware, createStoreOwner);
router.delete('/store-owner/:id', adminMiddleware, deleteStoreOwner);
router.get('/users', adminMiddleware, getAllUsers);
router.get('/store-owners', adminMiddleware, getAllStoreOwners);

export default router;
