import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../logger/logger.js", () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));

import ForbiddenError from "../../errors/ForbiddenError.js";
import { requirePermission } from "../permission.middleware.js";


function runMiddleware(permission, role) {
    const middleware = requirePermission(permission);
    const req = role === undefined ? {} : { user: { id: 1, role } };
    const next = vi.fn();
    middleware(req, {}, next);
    return next;
}

describe("requirePermission", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("allowed", () => {
        it("calls next without error when a user role has the permission", () => {
            const next = runMiddleware("student:read", "user");
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });

        it("calls next without error when an admin role has the permission", () => {
            const next = runMiddleware("student:delete", "admin");
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });

        it("allows any permission for superadmin via wildcard", () => {
            const next = runMiddleware("anything:at:all", "superadmin");
            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
        });
    });

    describe("forbidden", () => {
        it("passes a ForbiddenError to next when a known role lacks the permission", () => {
            const next = runMiddleware("student:delete", "user");
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error).toBeInstanceOf(ForbiddenError);
            expect(error.statusCode).toBe(403);
            expect(error.message).toBe("Insufficient permissions");
        });

        it("passes a ForbiddenError to next when the role does not exist in the map", () => {
            const next = runMiddleware("student:read", "viewer");
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error).toBeInstanceOf(ForbiddenError);
            expect(error.statusCode).toBe(403);
        });

        it("passes a ForbiddenError to next when req.user is missing", () => {
            const next = runMiddleware("student:read", undefined);
            expect(next).toHaveBeenCalledTimes(1);
            const error = next.mock.calls[0][0];
            expect(error).toBeInstanceOf(ForbiddenError);
            expect(error.statusCode).toBe(403);
            expect(error.message).toBe("Insufficient permissions");
        });
    });
});
