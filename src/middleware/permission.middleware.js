import logger from "../logger/logger.js";
import ForbiddenError from "../errors/ForbiddenError.js";

const permissions = {
    user: [
        "student:read",
        "course:read"
    ],

    admin: [
        "student:create",
        "student:read",
        "student:update",
        "student:delete",
        "course:create",
        "course:read",
        "course:update",
        "course:delete"
    ],

    superadmin: ["*"]
};

export function requirePermission(permission) {
    return (req, res, next) => {
        logger.info(`Permission check: ${permission}`);
        const userPermissions = permissions[req.user.role];

        if (!userPermissions) {
            return next(new ForbiddenError("Insufficient permissions"));
        }

        if (userPermissions.includes("*")) {
            return next();
        }

        if (userPermissions.includes(permission)) {
            return next();
        }

        return next(new ForbiddenError("Insufficient permissions"));
    };
}