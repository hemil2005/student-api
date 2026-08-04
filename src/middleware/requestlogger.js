import logger from "../logger/logger.js";

export function requestLogger(req, res, next) {

    const start = Date.now();

    res.on("finish", () => {

        const duration =
            Date.now() - start;

        logger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`
        });

    });

    next();

}