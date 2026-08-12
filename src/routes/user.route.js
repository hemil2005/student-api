import express from 'express';
import * as userController from '../controllers/user.controller.js'
import { validateUser } from '../middleware/user.validation.js';
import { authenticate, authenticateRefresh } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();
router.post('/register', validateUser, userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/make-admin/:id', authenticate, authorize(["admin", "superadmin"]), userController.grantAdminAccess);
router.post('/auth/refresh', authenticateRefresh, userController.refreshToken);

export default router;