import { Router } from "express";
import {login, register, getOwnProfile, updateProfile, changePassword} from '../controller/user.controller.ts'
import { authMiddleware } from '../middleware/user.middleware.ts'

const router = Router();

router.post('/login',login);
router.post('/register',register);
router.get('/me', authMiddleware, getOwnProfile);
router.patch('/me', authMiddleware, updateProfile);
router.patch('/me/password', authMiddleware, changePassword);

export default router;