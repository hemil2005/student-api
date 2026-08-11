// catches the error thrown from anywhere in the system
// returns a proper standardized error response to the client
// logs the error to the console later logger file
// returns appropriate status code like 404, 401, 403
import logger from "../logger/logger.js";
import config from "../config/env.js";

export function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    logger.error(err); // Log the error for debugging

    res.status(statusCode).json({
        message: err.message,
        statusCode: statusCode,
        status: status,
        isOperational: err.isOperational,
        name: err.name,
        details: err.details,
        stack: config.nodeEnv === "development" ? err.stack : {}
    });
}