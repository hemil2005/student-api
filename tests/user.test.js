import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app.js";
import redisClient from "../src/config/redis.js";
import config from "../src/config/env.js";

let adminToken;

beforeAll(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    const response = await request(app).post("/users/login").send({
        email: "hemil2@gmail.com",
        password: "123456"
    });
    adminToken = response.body.token;
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

describe("PUT /users/make-admin/:id", () => {
    it("should return 400 if the user ID is not a number", async () => {
        const response = await request(app)
            .put("/users/make-admin/abc")
            .set("Authorization", `Bearer ${adminToken}`);

        expect(response.status).toBe(400);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid user ID"
        });
    });
});

describe("POST /users/auth/refresh", () => {
    it("should return 401 for an expired refresh token", async () => {
        const expiredToken = jwt.sign(
            { id: 1, role: "admin" },
            config.jwtRefreshSecret,
            { expiresIn: "-10s" }
        );

        const response = await request(app)
            .post("/users/auth/refresh")
            .send({ refresh_token: expiredToken });

        expect(response.status).toBe(401);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty("status", "fail");
        expect(response.body).toHaveProperty("statusCode", 401);
    });

    it("should return 401 if the refresh token is missing", async () => {
        const response = await request(app)
            .post("/users/auth/refresh")
            .send({});

        expect(response.status).toBe(401);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty(
            "message",
            "Refresh token is required"
        );
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
