import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("GET /", () => {
    it("should return 200 and the welcome message for the home directory", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body).toEqual({
            message: "Welcome to the Student API Home Directory!"
        });
    });
});
