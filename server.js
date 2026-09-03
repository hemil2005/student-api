import app from './app.js';
import prisma from './src/config/prisma.js';
import redisClient from './src/config/redis.js';
import config from './src/config/env.js';
import logger from './src/logger/logger.js';
import { createShutdownHandler } from './src/utils/shutdown.js';

async function start() {
    // Verify DB connection
    await prisma.$queryRaw`SELECT 1`;

    // Connect Redis before the server starts accepting requests
    await redisClient.connect();

    const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`);
    });

    const shutdown = createShutdownHandler({
        server,
        prisma,
        redisClient,
        logger
    });

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    return { server, shutdown };
}

start().catch((err) => {
    logger.error(`Failed to start server: ${err?.message || err}`);
    process.exit(1);
});

export { start };