import { Router } from 'express';
import { storeOwnerMiddleware } from '../middleware/user.middleware.ts';
import { getAllProducts, getProductById, createProduct, updateOwnProduct, deleteOwnProduct } from '../controller/product.controller.ts';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/:storeId', storeOwnerMiddleware, createProduct);
router.put('/:id', storeOwnerMiddleware, updateOwnProduct);
router.delete('/:id', storeOwnerMiddleware, deleteOwnProduct);

export default router;
