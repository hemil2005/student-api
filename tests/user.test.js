import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import redisClient from "../src/config/redis.js";

beforeAll(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
});

afterAll(async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
});

describe("POST /users/login", () => {
    it("should return 200 and the JWT token", async () => {
        const response = await request(app).post("/users/login").send({
            email: "hemil2@gmail.com",
            password: "123456"
        });
        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty("token");
        expect(response.body).toHaveProperty("refresh_token");
        expect(response.body).toHaveProperty("user");
        expect(response.body.user).toHaveProperty("id");
        expect(response.body.user).toHaveProperty("name");
        expect(response.body.user).toHaveProperty("email");
        expect(response.body.user).toHaveProperty("role");
    });

    it("should return 401 if the password is wrong", async () => {
        const response = await request(app).post("/users/login").send({
            email: "hemil2@gmail.com",
            password: "wrongpassword123"
        });
        expect(response.status).toBe(401);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty("message", "Invalid email or password");
    });
});

describe("POST /users/login rate limiting", () => {
    it("should return 429 with a standardized error after exceeding the limit", async () => {
        let lastResponse;
        let saw429 = false;

        for (let i = 0; i < 15 && !saw429; i++) {
            lastResponse = await request(app)
                .post("/users/login")
                .send({
                    email: "ratelimit-probe@example.com",
                    password: "irrelevant"
                });
            if (lastResponse.status === 429) {
                saw429 = true;
            }
        }

        expect(lastResponse).toBeDefined();
        expect(saw429).toBe(true);
        expect(lastResponse.status).toBe(429);
        expect(lastResponse.headers["content-type"]).toMatch(/json/);
        expect(lastResponse.body).toHaveProperty(
            "message",
            "Too many requests from this IP, please try again later"
        );
        expect(lastResponse.body).toHaveProperty("statusCode", 429);
        expect(lastResponse.body).toHaveProperty("status", "fail");
    });
});
