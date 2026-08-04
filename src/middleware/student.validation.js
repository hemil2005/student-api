import { z } from "zod";
import ValidationError from "../errors/ValidationError.js";
const studentSchema = z.object({
    name: z.string().min(3).max(50).trim(),
    age: z.number().min(16).max(100).int(),
    course: z.string().min(2).trim()
})
export function validateStudent(req, res, next) {
    const result = studentSchema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.issues);
    }
    next();
}