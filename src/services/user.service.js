import bcrypt from "bcrypt";
import prisma from '../config/prisma.js'
import ConflictError from "../errors/ConflictError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import logger from "../logger/logger.js";
import { createJWT } from "../utils/jwt.js";
import NotFoundError from "../errors/NotFoundError.js";

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
            password: hashedPassword,
            role: "user"
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        }
    });
    logger.info("User registered successfully");
    return result;
}
export async function loginUser(email, password) {
    const result = await prisma.users.findUnique({
        where: {
            email: email
        },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true
        }
    })
    if (!result) {
        throw new UnauthorizedError("Invalid email or password");
    }
    const isPasswordValid = await bcrypt.compare(password, result.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError("Invalid email or password");
    }
    // return {
    //     id: result.id,
    //     email: result.email,
    //     name: result.name
    // };
    const token = createJWT({
        id: result.id,
        role: result.role
    });
    return {
        token,
        user: {
            id: result.id,
            name: result.name,
            email: result.email,
            role: result.role
        },
    };
}
export async function grantAdminAccess(userID){
    logger.info("Granting admin access to user");
    const user = await prisma.users.findUnique({where: {id:userID}});
    if(!user){
        throw new NotFoundError("User not found");
    }
    if(user.role === "admin"){
        throw new ConflictError("User is already an admin");
    }
    const updatedUser = await prisma.users.update({
        where: {id:userID},
        data: {role:"admin"},
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        }
    });
    logger.info("Admin access granted successfully");
    return updatedUser;
}