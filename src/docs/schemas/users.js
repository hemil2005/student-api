export default {
    User: {
        type: "object",
        required: ["id", "name", "email", "role"],
        properties: {
            id: { type: "integer", example: 4 },
            name: { type: "string", example: "New User" },
            email: { type: "string", format: "email", example: "newuser@example.com" },
            role: { type: "string", enum: ["user", "admin", "superadmin"], example: "user" },
            created_at: { type: "string", format: "date-time", example: "2026-08-26T10:00:00.000Z" }
        }
    },
    RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
            name: { type: "string", minLength: 3, maxLength: 50, example: "New User" },
            email: { type: "string", format: "email", example: "newuser@example.com" },
            password: { type: "string", minLength: 6, maxLength: 20, example: "secret123" }
        }
    },
    LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
            email: { type: "string", format: "email", example: "hemil2@gmail.com" },
            password: { type: "string", example: "123456" }
        }
    },
    LoginResponse: {
        type: "object",
        required: ["token", "refresh_token", "user"],
        properties: {
            token: { type: "string", example: "<access JWT>" },
            refresh_token: { type: "string", example: "<refresh JWT>" },
            user: { $ref: "#/components/schemas/User" }
        }
    },
    RefreshTokenRequest: {
        type: "object",
        required: ["refresh_token"],
        properties: {
            refresh_token: { type: "string", example: "<refresh JWT>" }
        }
    },
    RefreshTokenResponse: {
        type: "object",
        required: ["status", "token", "refresh_token"],
        properties: {
            status: { type: "string", example: "success" },
            token: { type: "string", example: "<new access JWT>" },
            refresh_token: { type: "string", example: "<new refresh JWT>" }
        }
    }
};
