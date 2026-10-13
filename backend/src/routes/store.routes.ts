import { Router } from 'express';
import { storeOwnerMiddleware } from '../middleware/user.middleware.ts';
import { getAllStores, getStoreById, createStore, updateOwnStore, deleteOwnStore } from '../controller/store.controller.ts';

const router = Router();

router.get('/', getAllStores);
router.get('/:id', getStoreById);

router.post('/', storeOwnerMiddleware, createStore);
router.put('/:id', storeOwnerMiddleware, updateOwnStore);
router.delete('/:id', storeOwnerMiddleware, deleteOwnStore);

export default router;
