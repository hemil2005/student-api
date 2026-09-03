import { describe, it, expect, vi, beforeEach } from "vitest";
import { createShutdownHandler } from "../../utils/shutdown.js";

describe("Graceful Shutdown Handler", () => {
    let mockServer;
    let mockPrisma;
    let mockRedisClient;
    let mockLogger;
    let mockExitProcess;
    let executionOrder;

    beforeEach(() => {
        executionOrder = [];

        mockServer = {
            listening: true,
            close: vi.fn((cb) => {
                executionOrder.push("server.close");
                cb();
            }),
        };

        mockRedisClient = {
            isOpen: true,
            quit: vi.fn(async () => {
                executionOrder.push("redis.quit");
            }),
        };

        mockPrisma = {
            $disconnect: vi.fn(async () => {
                executionOrder.push("prisma.$disconnect");
            }),
        };

        mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };

        mockExitProcess = vi.fn();
    });

    it("executes cleanup in the correct sequence and exits with code 0", async () => {
        const shutdown = createShutdownHandler({
            server: mockServer,
            prisma: mockPrisma,
            redisClient: mockRedisClient,
            logger: mockLogger,
            timeoutMs: 1000,
            exitProcess: mockExitProcess,
        });

        await shutdown("SIGTERM");

        expect(executionOrder).toEqual([
            "server.close",
            "redis.quit",
            "prisma.$disconnect",
        ]);

        expect(mockServer.close).toHaveBeenCalledTimes(1);
        expect(mockRedisClient.quit).toHaveBeenCalledTimes(1);
        expect(mockPrisma.$disconnect).toHaveBeenCalledTimes(1);
        expect(mockExitProcess).toHaveBeenCalledWith(0);
    });

    it("is idempotent and does not run cleanup multiple times on duplicate signals", async () => {
        const shutdown = createShutdownHandler({
            server: mockServer,
            prisma: mockPrisma,
            redisClient: mockRedisClient,
            logger: mockLogger,
            timeoutMs: 1000,
            exitProcess: mockExitProcess,
        });

        // Trigger two signals concurrently
        await Promise.all([shutdown("SIGTERM"), shutdown("SIGINT")]);

        expect(mockServer.close).toHaveBeenCalledTimes(1);
        expect(mockRedisClient.quit).toHaveBeenCalledTimes(1);
        expect(mockPrisma.$disconnect).toHaveBeenCalledTimes(1);
        expect(mockExitProcess).toHaveBeenCalledTimes(1);
        expect(mockLogger.warn).toHaveBeenCalledWith(
            expect.stringContaining("Shutdown already in progress")
        );
    });

    it("skips redis quit if redis is already disconnected", async () => {
        mockRedisClient.isOpen = false;

        const shutdown = createShutdownHandler({
            server: mockServer,
            prisma: mockPrisma,
            redisClient: mockRedisClient,
            logger: mockLogger,
            timeoutMs: 1000,
            exitProcess: mockExitProcess,
        });

        await shutdown("SIGTERM");

        expect(mockRedisClient.quit).not.toHaveBeenCalled();
        expect(mockPrisma.$disconnect).toHaveBeenCalledTimes(1);
        expect(mockExitProcess).toHaveBeenCalledWith(0);
    });

    it("continues closing remaining resources and exits with code 1 if a step fails", async () => {
        mockRedisClient.quit.mockRejectedValueOnce(new Error("Redis quit failed"));

        const shutdown = createShutdownHandler({
            server: mockServer,
            prisma: mockPrisma,
            redisClient: mockRedisClient,
            logger: mockLogger,
            timeoutMs: 1000,
            exitProcess: mockExitProcess,
        });

        await shutdown("SIGTERM");

        expect(mockServer.close).toHaveBeenCalledTimes(1);
        expect(mockRedisClient.quit).toHaveBeenCalledTimes(1);
        // Prisma disconnect must still be called even though Redis quit failed
        expect(mockPrisma.$disconnect).toHaveBeenCalledTimes(1);
        expect(mockExitProcess).toHaveBeenCalledWith(1);
        expect(mockLogger.error).toHaveBeenCalledWith(
            expect.stringContaining("Redis quit failed")
        );
    });
});
