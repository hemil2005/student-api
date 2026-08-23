import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import redisClient from "../src/config/redis.js";

let token;

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

        token = response.body.token;
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

describe("GET /students/:id", () => {
    it("should return 200 and the student", async () => {
        const response = await request(app)
            .get("/students/8")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty("status", "success");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("id");
        expect(response.body.data).toHaveProperty("name");
    });

    it("should return 401 if authorization header is missing", async () => {
        const response = await request(app).get("/students/8");
        expect(response.status).toBe(401);
    });
});