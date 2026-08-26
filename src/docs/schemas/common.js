export default {
    ApiError: {
        type: "object",
        required: ["status", "message"],
        properties: {
            status: { type: "string", enum: ["error"], example: "error" },
            message: { type: "string", example: "Invalid student ID" }
        }
    },
    ErrorResponse: {
        type: "object",
        required: ["status", "statusCode", "message"],
        properties: {
            status: { type: "string", enum: ["fail"], example: "fail" },
            statusCode: { type: "integer", example: 400 },
            message: { type: "string", example: "name: String must contain at least 3 character(s)" }
        }
    }
};
