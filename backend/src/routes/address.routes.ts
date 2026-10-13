import { Router } from "express";
import { authMiddleware } from '../middleware/user.middleware.ts'
import { createAddress, getOwnAddresses, deleteAddress } from '../controller/address.controller.ts'

const router = Router();

router.post('/', authMiddleware, createAddress);
router.get('/me', authMiddleware, getOwnAddresses);
router.delete('/:id', authMiddleware, deleteAddress);

export default router;
