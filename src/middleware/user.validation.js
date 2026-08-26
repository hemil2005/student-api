import { z } from "zod";
import ValidationError from "../errors/ValidationError.js";
const userSchema = z.object({
    name: z.string().min(3).max(50).trim(),
    email: z.string().email().trim(),
    password: z.string().min(6).max(20)
})
export function validateUser(req, res, next) {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
        throw new ValidationError(result.error.issues);
    }
    req.body = result.data;
    next();
}