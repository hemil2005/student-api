import express from 'express'
import * as studentController from '../controllers/student.controller.js'
import {validateStudent} from '../middleware/student.validation.js'
const router = express.Router();
router.get('/', studentController.getALLStudents);
router.get('/:id', studentController.getStudentById);
router.post('/', validateStudent, studentController.createStudent);
router.patch('/:id', validateStudent, studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
export default router;
