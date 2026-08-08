import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";

export function createJWT(payload){
    logger.info("Creating JWT");
    const secret = process.env.JWT_SECRET;
    if(!secret){
        throw new Error("JWT secret is not defined");
    }
    logger.info("JWT created successfully");
    return jwt.sign(payload, secret, { expiresIn: "1h" });
}