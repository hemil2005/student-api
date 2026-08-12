import express from 'express';
import * as courseController from '../controllers/course.controller.js';
import { validateCourse } from '../middleware/course.validation.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';

const router = express.Router();
router.get('/', authenticate, requirePermission("course:read"), courseController.getAllCourses);
router.get('/:id', authenticate, requirePermission("course:read"), courseController.getCourseById);
router.post('/', authenticate, requirePermission("course:create"), validateCourse, courseController.createCourse);
router.patch('/:id', authenticate, requirePermission("course:update"), validateCourse, courseController.updateCourse);
router.delete('/:id', authenticate, requirePermission("course:delete"), courseController.deleteCourse);

export default router;
