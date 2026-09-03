/**
 * Creates an idempotent graceful shutdown handler for the HTTP server,
 * Redis client, and Prisma client.
 *
 * @param {Object} options
 * @param {import('http').Server} [options.server] - Node HTTP server instance
 * @param {Object} [options.prisma] - PrismaClient instance
 * @param {Object} [options.redisClient] - Redis client instance
 * @param {Object} [options.logger] - Logger instance (defaults to console)
 * @param {number} [options.timeoutMs] - Maximum wait time before forcing exit (default 10000ms)
 * @param {Function} [options.exitProcess] - Process exit function (defaults to process.exit)
 * @returns {Function} Function to invoke with a signal name (e.g. 'SIGTERM')
 */
export function createShutdownHandler({
    server,
    prisma,
    redisClient,
    logger = console,
    timeoutMs = 10000,
    exitProcess = (code) => process.exit(code)
} = {}) {
    let isShuttingDown = false;

    return async function handleShutdown(signal = 'SIGTERM') {
        if (isShuttingDown) {
            logger.warn(`Shutdown already in progress. Ignoring ${signal}.`);
            return;
        }
        isShuttingDown = true;
        logger.info(`Received ${signal}. Starting graceful shutdown...`);

        // Timeout timer to prevent process from hanging indefinitely
        const forceExitTimer = setTimeout(() => {
            logger.error(`Graceful shutdown timed out after ${timeoutMs}ms. Forcing exit.`);
            exitProcess(1);
        }, timeoutMs);

        if (forceExitTimer.unref) {
            forceExitTimer.unref();
        }

        let hasError = false;

        // 1. Stop accepting new HTTP requests and wait for active requests to finish
        try {
            if (server) {
                await new Promise((resolve, reject) => {
                    if (!server.listening) {
                        return resolve();
                    }
                    server.close((err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                });
                logger.info("HTTP server closed.");
            }
        } catch (err) {
            hasError = true;
            logger.error(`Error closing HTTP server: ${err?.message || err}`);
        }

        // 2. Close Redis connection if open
        try {
            if (redisClient && redisClient.isOpen) {
                await redisClient.quit();
                logger.info("Redis client disconnected.");
            }
        } catch (err) {
            hasError = true;
            logger.error(`Error disconnecting Redis: ${err?.message || err}`);
        }

        // 3. Disconnect Prisma client
        try {
            if (prisma && typeof prisma.$disconnect === "function") {
                await prisma.$disconnect();
                logger.info("Prisma client disconnected.");
            }
        } catch (err) {
            hasError = true;
            logger.error(`Error disconnecting Prisma: ${err?.message || err}`);
        }

        clearTimeout(forceExitTimer);

        if (hasError) {
            logger.error("Graceful shutdown completed with errors.");
            exitProcess(1);
        } else {
            logger.info("Graceful shutdown completed successfully.");
            exitProcess(0);
        }
    };
}
