import express from 'express'
import * as studentController from '../controllers/student.controller.js'
import { validateStudent } from '../middleware/student.validation.js'
import { authenticate } from '../middleware/auth.middleware.js';
const router = express.Router();
router.get('/', authenticate, studentController.getALLStudents);
router.get('/:id', authenticate, studentController.getStudentById);
router.post('/', authenticate, validateStudent, studentController.createStudent);
router.patch('/:id', authenticate, validateStudent, studentController.updateStudent);
router.delete('/:id', authenticate, studentController.deleteStudent);
export default router;
