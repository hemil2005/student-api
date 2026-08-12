import express from 'express';
import * as userController from '../controllers/user.controller.js'
import { validateUser } from '../middleware/user.validation.js';
import { authenticate, authenticateRefresh } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import rateLimiter from '../middleware/rateLimit.middleware.js';
const router = express.Router();
router.post('/register', rateLimiter.registerLimiter, validateUser, userController.registerUser);
router.post('/login', rateLimiter.loginLimiter, userController.loginUser);
router.put('/make-admin/:id', authenticate, authorize(["admin", "superadmin"]), rateLimiter.adminLimiter, userController.grantAdminAccess);
router.post('/auth/refresh', rateLimiter.refreshLimiter, authenticateRefresh, userController.refreshToken);

export default router;
