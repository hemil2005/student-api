import express from 'express';
import * as userController from '../controllers/user.controller.js'
import { validateUser } from '../middleware/user.validation.js';
const router = express.Router();
router.post('/register', validateUser, userController.registerUser);
router.post('/login', userController.loginUser);
export default router;