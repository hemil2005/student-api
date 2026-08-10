import logger from "../logger/logger.js";
import prisma from "../config/prisma.js";
import ConflictError from "../errors/ConflictError.js";
import NotFoundError from "../errors/NotFoundError.js";

export async function createCourse(course) {
    logger.info("Creating course");
    const check = await prisma.courses.findFirst({
        where: {
            name: course.name
        }
    })
    if (check) {
        logger.error("Course already exists");
        throw new ConflictError("Course already exists");
    }
    const result = await prisma.courses.create({
        data: course
    })
    logger.info("Course created successfully");
    return result;
}

export async function getCourseById(id) {
    logger.info("Getting course by id");
    const result = await prisma.courses.findUnique({
        where: {
            id: id
        },
        include: {
            students: true
        }
    })
    if (!result) {
        logger.error("Course not found");
        throw new NotFoundError("Course not found");
    }
    logger.info("Course fetched successfully");
    return result;
}

export async function getAllCourses() {
    logger.info("Fetching all courses");
    const result = await prisma.courses.findMany()
    logger.info("All courses fetched successfully");
    return result;
}
export async function deleteCourse(id) {
    logger.info("Deleting course");
    const result = await prisma.courses.delete({
        where: {
            id: id
        }
    })
    if (!result) {
        logger.error("Course not found");
        throw new NotFoundError("Course not found");
    }
    logger.info("Course deleted successfully");
    return result;
}
export async function updateCourse(id, data) {
    logger.info("Updating course");
    const result = await prisma.courses.update({
        where: {
            id: id
        },
        data: {
            name: data.name
        }
    })
    if (!result) {
        logger.error("Course not found");
        throw new NotFoundError("Course not found");
    }
    logger.info("Course updated successfully");
    return result;
}