import { z } from "zod";
import ValidationError from "../errors/ValidationError.js";
import logger from "../logger/logger.js";

const studentSchema = z.object({
    name: z.string().min(3).max(50).trim(),
    age: z.number().min(16).max(100).int(),
    course_id: z.number()
});

const studentUpdateSchema = studentSchema.partial();

export function validateStudent(req, res, next) {
    logger.info("Validating student");
    const schema = req.method === "PATCH" ? studentUpdateSchema : studentSchema;
    const result = schema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.issues);
    }
    req.body = result.data;
    logger.info("Student validated successfully");
    next();
}
