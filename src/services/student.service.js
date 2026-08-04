import { infoLogger } from '../logger/logger.js';
import { students } from '../data/students.js';
import NotFoundError from "../errors/NotFoundError.js";
import ConflictError from "../errors/ConflictError.js";
export function getAllStudents() {
    infoLogger.info("Getting all students");
    return students;
}

export function getStudentById(id) {
    infoLogger.info("Getting student by id");
    const student = students.find(student => student.id === id);
    if (!student) {
        throw new NotFoundError("Student not found");
    }
    return student;
}

export function createStudent(student) {
    infoLogger.info("Creating student");
    if (student.id == null || student.id == undefined) {
        const id = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
        student.id = id;
    }
    else if (students.find(alreadyStudent => alreadyStudent.id == student.id)) {
        throw new ConflictError("Student already exists");
    }
    students.push(student);
    return student;
}

export function updateStudent(id, data) {
    infoLogger.info("Updating student");
    const student = students.find(student => student.id === id);
    if (!student) {
        throw new NotFoundError("Student not found");
    }
    if (data.name) {
        student.name = data.name;
    }
    if (data.age) {
        student.age = data.age;
    }
    if (data.course) {
        student.course = data.course;
    }
    return student;
}

export function deleteStudent(id) {
    infoLogger.info("Deleting student");
    const index = students.findIndex(student => student.id === id);
    if (index === -1) {
        throw new NotFoundError("Student not found");
    }
    const [deletedStudent] = students.splice(index, 1);
    return deletedStudent;
}
