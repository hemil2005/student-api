import { describe, it, expect } from "vitest";
import request from "supertest";
import openapiSpecification from "../src/docs/openapi.js";
import app from "../app.js";

describe("openapi contract", () => {
    it("has OpenAPI version", () => {
        expect(openapiSpecification.openapi).toBeTruthy();
        expect(openapiSpecification.openapi).toMatch(/^3\./);
    });

    it("has /students path", () => {
        expect(openapiSpecification.paths["/students"]).toBeDefined();
    });

    it("has /courses path", () => {
        expect(openapiSpecification.paths["/courses"]).toBeDefined();
    });

    it("has /users/login path", () => {
        expect(openapiSpecification.paths["/users/login"]).toBeDefined();
    });

    it("has bearerAuth security scheme", () => {
        expect(openapiSpecification.components?.securitySchemes?.bearerAuth).toBeDefined();
        expect(openapiSpecification.components.securitySchemes.bearerAuth.type).toBe("http");
        expect(openapiSpecification.components.securitySchemes.bearerAuth.scheme).toBe("bearer");
    });

    it("has Student schema", () => {
        expect(openapiSpecification.components?.schemas?.Student).toBeDefined();
    });

    it("has Course schema", () => {
        expect(openapiSpecification.components?.schemas?.Course).toBeDefined();
    });

    it("has User schema", () => {
        expect(openapiSpecification.components?.schemas?.User).toBeDefined();
    });

    it("has ApiError schema", () => {
        expect(openapiSpecification.components?.schemas?.ApiError).toBeDefined();
    });

    it("has ErrorResponse schema", () => {
        expect(openapiSpecification.components?.schemas?.ErrorResponse).toBeDefined();
    });

    it("has operationId on every operation", () => {
        for (const [path, methods] of Object.entries(openapiSpecification.paths)) {
            for (const [method, operation] of Object.entries(methods)) {
                expect(
                    operation.operationId,
                    `${method.toUpperCase()} ${path} is missing operationId`
                ).toBeTruthy();
            }
        }
    });
});

describe("GET /api-docs", () => {
    it("serves Swagger UI", async () => {
        const res = await request(app).get("/api-docs/");
        expect(res.status).toBe(200);
        expect(res.headers["content-type"]).toMatch(/html/);
        expect(res.text).toMatch(/swagger/i);
    });
});
