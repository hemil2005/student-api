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

export async function createStudent(req, res) {
    const student = req.body;
    const createdStudent = await studentService.createStudentWithLog(student);
    res.status(201).json(createdStudent);
}

export async function updateStudent(req, res) {
    const id = Number(req.params.id);
    const data = req.body;
    const updatedStudent = await studentService.updateStudent(id, data);
    res.status(200).json(updatedStudent);
}

export  async function deleteStudent(req, res) {
    const id = Number(req.params.id);
    const deletedStudent = await studentService.deleteStudent(id);
    res.status(200).json(deletedStudent);
}