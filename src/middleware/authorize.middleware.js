import ForbiddenError from "../errors/ForbiddenError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import logger from "../logger/logger.js";

export function authorize(roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        logger.info("Authorizing user");
        
        if (!req.user) {
            throw new UnauthorizedError("Authentication required");
        }
        
        if (!allowedRoles.includes(req.user.role)) {
            throw new ForbiddenError("You are not authorized to perform this action");
        }
        
        logger.info("User authorized successfully");
        next();
    };
}