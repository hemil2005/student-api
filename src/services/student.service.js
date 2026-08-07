import logger from '../logger/logger.js';
import NotFoundError from "../errors/NotFoundError.js";
import ConflictError from "../errors/ConflictError.js";
import prisma from '../config/prisma.js';
import { Prisma } from '../generated/prisma/index.js';


export async function getAllStudents() {
    logger.info("Fetching all students");
    const result = await prisma.students.findMany({
        include: { courses: true }
    });
    return result;
}

export async function getStudentById(id) {
    logger.info("Getting student by id");
    // findUnique returns null (not throws) when not found — if-check is correct here
    const result = await prisma.students.findUnique({
        where: { id },
        include: { courses: true }
    });
    if (!result) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
    return result;
}

export async function createStudent(student) {
    logger.info("Creating student");
    const check = await prisma.students.findFirst({
        where: { name: student.name, age: student.age, course_id: student.course_id }
    });
    if (check) {
        logger.error("Student already exists");
        throw new ConflictError("Student already exists");
    }
    const result = await prisma.students.create({ data: student });
    return result;
}

export async function updateStudent(id, data) {
    logger.info("Updating student");
    // prisma.update throws P2025 (not returns null) when record not found
    try {
        const result = await prisma.students.update({
            where: { id },
            data: {
                name: data.name,
                age: data.age,
                course_id: data.course_id
            }
        });
        return result;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            logger.error("Student not found");
            throw new NotFoundError("Student not found");
        }
        throw error;
    }
}

export async function deleteStudent(id) {
    logger.info("Deleting student");
    // prisma.delete throws P2025 (not returns null) when record not found
    try {
        const result = await prisma.students.delete({ where: { id } });
        return result;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            logger.error("Student not found");
            throw new NotFoundError("Student not found");
        }
        throw error;
    }
}
