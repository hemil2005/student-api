import { z } from "zod";
import ValidationError from "../errors/ValidationError.js";
import logger from "../logger/logger.js";
const courseSchema = z.object({
    name: z.string().min(3).max(50).trim(),
})
export function validateCourse(req, res, next) {
    logger.info("Validating course");
    const result = courseSchema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.issues);
    }
    req.body = result.data;
    logger.info("Course validated successfully");
    next();
}