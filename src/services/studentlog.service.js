import logger from '../logger/logger.js';
import prisma from "../config/prisma.js";
export async function createStudentLog(studentId, action, tx = prisma) {
    logger.info("Creating student log");
    return await tx.student_logs.create({
        data: {
            student_id: studentId,
            action: action
        }
    })
}

export async function getStudentLogs(studentId, tx = prisma) {
    logger.info("Getting student logs");
    return await tx.student_logs.findMany({
        where: {
            student_id: studentId
        }
    })
}