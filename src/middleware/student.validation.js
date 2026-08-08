import { z } from "zod";
import ValidationError from "../errors/ValidationError.js";
import logger from "../logger/logger.js";
const studentSchema = z.object({
    name: z.string().min(3).max(50).trim(),
    age: z.number().min(16).max(100).int(),
    course_id: z.number()
})
export function validateStudent(req, res, next) {
    logger.info("Validating student");
    const result = studentSchema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.issues);
    }
    logger.info("Student validated successfully");
    next();
}