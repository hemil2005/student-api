import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../../app.js";
import redisClient from "../../config/redis.js";
import prisma from "../../config/prisma.js";
import { createJWT } from "../../utils/jwt.js";


let token;
let studentId;
let courseId;

beforeAll(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    const response = await request(app).post("/users/login").send({
        email: "hemil2@gmail.com",
        password: "123456"
    });
    token = response.body.token;

    const course = await prisma.courses.create({
        data: { name: `Test Course ${Date.now()}` }
    });
    courseId = course.id;
    const student = await prisma.students.create({
        data: { name: "Test Student", age: 20, course_id: courseId }
    });
    studentId = student.id;
});

afterAll(async () => {
    await prisma.student_logs.deleteMany({ where: { student_id: studentId } });
    await prisma.students.deleteMany({ where: { id: studentId } });
    await prisma.courses.deleteMany({ where: { id: courseId } });
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
});

describe("GET /students/:id", () => {
    it("should return 200 and the student", async () => {
        const response = await request(app)
            .get(`/students/${studentId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty("status", "success");
        expect(response.body).toHaveProperty("data");
        expect(response.body.data).toHaveProperty("id", studentId);
        expect(response.body.data).toHaveProperty("name", "Test Student");
    });

    it("should return 401 if authorization header is missing", async () => {
        const response = await request(app).get(`/students/${studentId}`);
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
                .get(`/students/${studentId}`)
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

describe("PATCH /students/:id", () => {
    it("should return 400 if the student ID is not a number", async () => {
        const response = await request(app)
            .patch("/students/abc")
            .set("Authorization", `Bearer ${token}`)
            .send({ age: 22 });

        expect(response.status).toBe(400);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid student ID"
        });
    });

    it("should return 200 and update the student with a partial body", async () => {
        const response = await request(app)
            .patch(`/students/${studentId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ age: 22 });

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toHaveProperty("status", "success");
        expect(response.body.data).toHaveProperty("id", studentId);
        expect(response.body.data).toHaveProperty("age", 22);
    });
});

describe("DELETE /students/:id", () => {
    it("should return 400 if the student ID is not a number", async () => {
        const response = await request(app)
            .delete("/students/abc")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toEqual({
            status: "error",
            message: "Invalid student ID"
        });
    });

    it("should return 200 and delete an existing student", async () => {
        const disposable = await prisma.students.create({
            data: { name: "Delete Me Student", age: 30, course_id: courseId }
        });

        try {
            const response = await request(app)
                .delete(`/students/${disposable.id}`)
                .set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toMatch(/json/);
            expect(response.body).toHaveProperty("status", "success");
            expect(response.body.data).toHaveProperty("id", disposable.id);

            const gone = await prisma.students.findUnique({ where: { id: disposable.id } });
            expect(gone).toBeNull();
        } finally {
            await prisma.student_logs.deleteMany({ where: { student_id: disposable.id } });
        }
    });
});