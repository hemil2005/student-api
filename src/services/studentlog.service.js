import logger from '../logger/logger.js';
import prisma from "../config/prisma.js";
export async function createStudentLog(studentId, action) {
    logger.info("Creating student log");
    return await prisma.student_logs.create({
        data: {
            student_id: studentId,
            action: action
        }
    })
}