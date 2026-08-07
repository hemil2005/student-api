import bcrypt from "bcrypt";
import prisma from '../config/prisma.js'
import ConflictError from "../errors/ConflictError.js";
import logger from "../logger/logger.js";


export async function registerUser(user) {
    logger.info("Registering user");
    const existingUser = await prisma.users.findUnique({ where: { email: user.email } });
    if (existingUser) {
        throw new ConflictError("User already exists");
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = await prisma.users.create({
        data: {
            name: user.name,
            email: user.email,
            password: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true,
            created_at: true,
        }
    });
    logger.info("User registered successfully");
    return result;
}