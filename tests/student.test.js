import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import redisClient from "../src/config/redis.js";
import prisma from "../src/config/prisma.js";
import { createJWT } from "../src/utils/jwt.js";

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

    it("should return 404 if the student does not exist", async () => {
        const response = await request(app)
            .get("/students/999999")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty("message", "Student not found");
        expect(response.body).toHaveProperty("statusCode", 404);
        expect(response.body).toHaveProperty("status", "fail");
    });

    it("should return 400 if the student ID is not a number", async () => {
        const response = await request(app)
            .get("/students/abc")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid student ID"
        });
    });

    it("should return 403 if the user's role lacks student:read", async () => {
        const email = "no-perm-test@example.com";
        await prisma.users.deleteMany({ where: { email } });
        const user = await prisma.users.create({
            data: {
                name: "No Perm Test User",
                email,
                password: "not-used-for-login",
                role: "viewer"
            }
        });

        try {
            const restrictedToken = createJWT({ id: user.id, role: user.role });
            const response = await request(app)
                .get("/students/8")
                .set("Authorization", `Bearer ${restrictedToken}`);

            expect(response.status).toBe(403);
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.body).toHaveProperty("message", "Insufficient permissions");
            expect(response.body).toHaveProperty("statusCode", 403);
            expect(response.body).toHaveProperty("status", "fail");
        } finally {
            await prisma.users.deleteMany({ where: { email } });
        }
    });
});