import * as studentService from '../services/student.service.js'
export async function getALLStudents(req, res) {
    const students = await studentService.getAllStudents();
    res.status(200).json(students);
}

export async function getStudentById(req, res) {
    const id = Number(req.params.id);
    const student = await studentService.getStudentById(id);
    res.status(200).json(student);
}

export function createStudent(req, res) {
    const student = req.body;
    const createdStudent = studentService.createStudent(student);
    res.status(201).json(createdStudent);
}

export function updateStudent(req, res) {
    const id = Number(req.params.id);
    const data = req.body;
    const updatedStudent = studentService.updateStudent(id, data);
    res.status(200).json(updatedStudent);
}

export function deleteStudent(req, res) {
    const id = Number(req.params.id);
    const deletedStudent = studentService.deleteStudent(id);
    res.status(200).json(deletedStudent);
}