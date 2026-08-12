import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";
import config from "../config/env.js";

export function createJWT(payload){
    logger.info("Creating JWT");
    return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
}

export function createRefreshJWT(payload){
    logger.info("Creating Refresh JWT");
    return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: "30d" });
}

export function verifyRefreshJWT(token){
    logger.info("Verifying Refresh JWT");
    return jwt.verify(token, config.jwtRefreshSecret);
}
