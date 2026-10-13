import { Router } from 'express';
import { storeOwnerMiddleware } from '../middleware/user.middleware.ts';
import { getOwnProfile, getOwnStores } from '../controller/storeOwner.controller.ts';

const router = Router();

router.get('/me', storeOwnerMiddleware, getOwnProfile);
router.get('/me/stores', storeOwnerMiddleware, getOwnStores);

export default router;
