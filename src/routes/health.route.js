import express from 'express';
import prisma from '../config/prisma.js';
import redisClient from '../config/redis.js';

const router = express.Router();

export async function checkHealth(req, res) {
    let dbStatus = "healthy";
    let redisStatus = "healthy";

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        dbStatus = "unhealthy";
    }

    try {
        if (!redisClient.isOpen) {
            redisStatus = "unhealthy";
        } else {
            const pong = await redisClient.ping();
            if (pong !== "PONG") {
                redisStatus = "unhealthy";
            }
        }
    } catch {
        redisStatus = "unhealthy";
    }

    const isHealthy = dbStatus === "healthy" && redisStatus === "healthy";
    const statusCode = isHealthy ? 200 : 503;

    return res.status(statusCode).json({
        status: isHealthy ? "ok" : "error",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: dbStatus,
            redis: redisStatus
        }
    });
}

router.get('/', checkHealth);

export default router;
