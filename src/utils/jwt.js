import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";
import config from "../config/env.js";

export function createJWT(payload){
    logger.info("Creating JWT");
    logger.info("JWT created successfully");
    return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
}