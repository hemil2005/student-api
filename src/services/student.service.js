import logger from '../logger/logger.js';
import { students } from '../data/students.js';
import NotFoundError from "../errors/NotFoundError.js";
import ConflictError from "../errors/ConflictError.js";

export function getAllStudents() {
    logger.info("Getting all students");
    return students;
}

export function getStudentById(id) {
    logger.info("Getting student by id");
    const student = students.find(student => student.id === id);
    if (!student) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
    return student;
}

export function createStudent(student) {
    logger.info("Creating student");
    if (student.id == null || student.id == undefined) {
        const id = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
        student.id = id;
    }
    else if (students.find(alreadyStudent => alreadyStudent.id == student.id)) {
        logger.error("Student already exists");
        throw new ConflictError("Student already exists");
    }
    students.push(student);
    return student;
}

export function updateStudent(id, data) {
    logger.info("Updating student");
    const student = students.find(student => student.id === id);
    if (!student) {
        logger.error("Student not found");
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
    logger.info("Deleting student");
    const index = students.findIndex(student => student.id === id);
    if (index === -1) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
    const [deletedStudent] = students.splice(index, 1);
    return deletedStudent;
}
