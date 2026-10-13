import { Router } from "express";
import { authMiddleware, storeOwnerMiddleware } from '../middleware/user.middleware.ts'
import { createOrder, getOwnOrders, getStoreOrders, updateOrderStatus } from '../controller/order.controller.ts'

const router = Router();

router.post('/', authMiddleware, createOrder);
router.get('/me', authMiddleware, getOwnOrders);
router.get('/store', storeOwnerMiddleware, getStoreOrders);
router.patch('/:id/status', storeOwnerMiddleware, updateOrderStatus);

export default router;
