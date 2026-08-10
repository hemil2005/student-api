import express from 'express'
import * as courseController from '../controllers/course.controller.js'
import { validateCourse } from '../middleware/course.validation.js'
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
const router = express.Router();
router.get('/', authenticate, courseController.getAllCourses);
router.get('/:id', authenticate, courseController.getCourseById);
router.post('/', authenticate, authorize(["admin", "superadmin"]), validateCourse, courseController.createCourse);
router.delete('/:id', authenticate, authorize(["admin", "superadmin"]), courseController.deleteCourse);
router.patch('/:id', authenticate, authorize(["admin", "superadmin"]), validateCourse, courseController.updateCourse);
export default router;
