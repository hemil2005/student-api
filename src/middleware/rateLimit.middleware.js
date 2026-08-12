import rateLimit from "express-rate-limit";
import logger from "../logger/logger.js";
import TooManyRequestsError from "../errors/TooManyRequests.js";

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many requests from this IP, please try again later",
    handler: (req, res, next, options) => {
        logger.warn(`Too many requests from IP: ${req.ip}`);
        return next(new TooManyRequestsError("Too many requests from this IP, please try again later"));
    },
});
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many requests from this IP, please try again later",
    handler: (req, res, next, options) => {
        logger.warn(`Too many requests from IP: ${req.ip}`);
        return next(new TooManyRequestsError("Too many requests from this IP, please try again later"));
    },
});
const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many requests from this IP, please try again later",
    handler: (req, res, next, options) => {
        logger.warn(`Too many requests from IP: ${req.ip}`);
        return next(new TooManyRequestsError("Too many requests from this IP, please try again later"));
    },
});
const adminLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: "Too many requests from this IP, please try again later",
    handler: (req, res, next, options) => {
        logger.warn(`Too many requests from IP: ${req.ip}`);
        return next(new TooManyRequestsError("Too many requests from this IP, please try again later"));
    },
});
export default { registerLimiter, loginLimiter, refreshLimiter, adminLimiter };