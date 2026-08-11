import jwt from "jsonwebtoken";
import logger from "../logger/logger.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import config from "../config/env.js";

export function authenticate(req, res, next) {
    logger.info("Authenticating user");
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Unauthorized");
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
        const decodedToken = jwt.verify(token, config.jwtSecret);
        req.user = decodedToken;
        logger.info(`User authenticated successfully ${decodedToken.email}`)
        next();
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired token");
    }
}