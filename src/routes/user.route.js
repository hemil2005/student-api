import express from 'express';
import * as userController from '../controllers/user.controller.js'
import { validateUser } from '../middleware/user.validation.js';
import { authenticate, authenticateRefresh } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import rateLimiter from '../middleware/rateLimit.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import passport from "../config/passport.js";
const router = express.Router();
router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["openid", "email", "profile"]
    })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session: false
    }),
    (req, res) => {
        res.json({
            message: "Google authentication successful",
            profile: req.user
        });
    }
);
router.post('/register', rateLimiter.registerLimiter, validateUser, userController.registerUser);
router.post('/login', rateLimiter.loginLimiter, userController.loginUser);
router.put('/make-admin/:id', authenticate, authorize(["admin", "superadmin"]), rateLimiter.adminLimiter, userController.grantAdminAccess);
router.post('/auth/refresh', rateLimiter.refreshLimiter, authenticateRefresh, userController.refreshToken);

export default router;
