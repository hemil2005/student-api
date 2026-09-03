import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import prisma from "../../config/prisma.js";
import redisClient from "../../config/redis.js";

describe("GET /health", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns 200 and healthy status when all dependencies are healthy", async () => {
        vi.spyOn(prisma, "$queryRaw").mockResolvedValue([{ 1: 1 }]);
        vi.spyOn(redisClient, "isOpen", "get").mockReturnValue(true);
        vi.spyOn(redisClient, "ping").mockResolvedValue("PONG");

        const response = await request(app).get("/health");

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toMatchObject({
            status: "ok",
            services: {
                database: "healthy",
                redis: "healthy"
            }
        });
        expect(typeof response.body.timestamp).toBe("string");
        expect(typeof response.body.uptime).toBe("number");
    });

    it("returns 503 when the database check fails", async () => {
        vi.spyOn(prisma, "$queryRaw").mockRejectedValue(new Error("DB connection timeout"));
        vi.spyOn(redisClient, "isOpen", "get").mockReturnValue(true);
        vi.spyOn(redisClient, "ping").mockResolvedValue("PONG");

        const response = await request(app).get("/health");

        expect(response.status).toBe(503);
        expect(response.body).toMatchObject({
            status: "error",
            services: {
                database: "unhealthy",
                redis: "healthy"
            }
        });
        // Ensure sensitive error details/stack traces are not leaked
        expect(response.body).not.toHaveProperty("error");
        expect(response.body).not.toHaveProperty("stack");
    });

    it("returns 503 when Redis is closed or ping fails", async () => {
        vi.spyOn(prisma, "$queryRaw").mockResolvedValue([{ 1: 1 }]);
        vi.spyOn(redisClient, "isOpen", "get").mockReturnValue(false);

        const response = await request(app).get("/health");

        expect(response.status).toBe(503);
        expect(response.body).toMatchObject({
            status: "error",
            services: {
                database: "healthy",
                redis: "unhealthy"
            }
        });
    });

    it("returns 503 when both database and Redis are unhealthy", async () => {
        vi.spyOn(prisma, "$queryRaw").mockRejectedValue(new Error("DB down"));
        vi.spyOn(redisClient, "isOpen", "get").mockReturnValue(true);
        vi.spyOn(redisClient, "ping").mockRejectedValue(new Error("Redis ECONNREFUSED"));

        const response = await request(app).get("/health");

        expect(response.status).toBe(503);
        expect(response.body).toMatchObject({
            status: "error",
            services: {
                database: "unhealthy",
                redis: "unhealthy"
            }
        });
    });
});
