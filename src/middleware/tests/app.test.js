import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../../app.js";

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

describe("reverse proxy trust", () => {
    it("has trust proxy configured for a single front-facing proxy", () => {
        expect(app.get("trust proxy")).toBe(1);
    });
});

describe("middleware pipeline", () => {
    it("parses JSON request bodies with single express.json middleware", async () => {
        const response = await request(app)
            .post("/users/register")
            .send({ name: "ab" });

        expect(response.status).toBe(400);
        expect(response.body.name).toBe("ValidationError");
    });
});
