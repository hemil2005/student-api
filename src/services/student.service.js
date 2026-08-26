import logger from '../logger/logger.js';
import NotFoundError from "../errors/NotFoundError.js";
import ConflictError from "../errors/ConflictError.js";
import prisma from '../config/prisma.js';
import { Prisma } from '../generated/prisma/index.js';
import { createStudentLog } from './studentlog.service.js';
import redisClient from '../config/redis.js';

export async function getAllStudents(page = 1, limit = 10, courseId, orderBy, search) {
    logger.info("Fetching all students");
    const skip = (page - 1) * limit;

    const where = {};
    if (courseId !== undefined) {
        where.course_id = courseId;
    }
    if (search !== undefined && search.trim() !== '') {
        where.name = { contains: search.trim(), mode: 'insensitive' };
    }

    const [data, totalRecords] = await Promise.all([
        prisma.students.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include: { courses: true }
        }),
        prisma.students.count({ where })
    ]);

    return {
        data,
        meta: {
            page,
            limit,
            totalRecords,
            totalPages: Math.ceil(totalRecords / limit)
        }
    };
}

export async function getStudentById(id) {
    logger.info("Getting student by id");
    // findUnique returns null (not throws) when not found — if-check is correct here
    const cached = await redisClient.get(`student:${id}`);
    if (cached) {
        logger.info(`Student:${id} found in cache`);
        return JSON.parse(cached);
    }
    const result = await prisma.students.findUnique({
        where: { id },
        include: { courses: true }
    });
    if (!result) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
    await redisClient.set(`student:${id}`, JSON.stringify(result), { EX: 3600 }); // cache for 1 hour
    logger.info(`Student:${id} fetched from db`);
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
    const result = await prisma.$transaction(async (tx) => {
        const newStudent = await tx.students.create({ data: student });
        await createStudentLog(newStudent.id, "Student created", tx);
        return newStudent;
    })
    return result;
}

export async function updateStudent(id, data) {
    logger.info("Updating student");
    // prisma.update throws P2025 (not returns null) when record not found
    try {
        const result = await prisma.$transaction(async (tx)=>{
        const updatedStudent = await tx.students.update({
            where: { id },
            data: {
                name: data.name,
                age: data.age,
                course_id: data.course_id
            }
        });
        await createStudentLog(updatedStudent.id, "Student updated", tx);
        return updatedStudent;
    })
    await redisClient.del(`student:${id}`);
    logger.info(`Cache invalidated for student:${id}`);
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
        const result = await prisma.$transaction(async (tx)=>{
        const deletedStudent = await tx.students.delete({ where: { id } });
        return deletedStudent;
    })
    await redisClient.del(`student:${id}`);
    logger.info(`Cache invalidated for student:${id}`);
    return result;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            logger.error("Student not found");
            throw new NotFoundError("Student not found");
        }
        throw error;
    }
}
