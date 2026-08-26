export default {
    Student: {
        type: "object",
        required: ["id", "name", "age"],
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", minLength: 3, maxLength: 50, example: "Hemil" },
            age: { type: "integer", minimum: 16, maximum: 100, example: 20 },
            course_id: {
                type: "integer",
                nullable: true,
                example: 1,
                description: "Null when student is not enrolled in a course"
            },
            courses: {
                type: "object",
                nullable: true,
                properties: {
                    id: { type: "integer", example: 1 },
                    name: { type: "string", example: "Computer Science" }
                }
            }
        }
    },
    CreateStudentRequest: {
        type: "object",
        required: ["name", "age", "course_id"],
        properties: {
            name: { type: "string", minLength: 3, maxLength: 50, example: "John Doe" },
            age: { type: "integer", minimum: 16, maximum: 100, example: 21 },
            course_id: { type: "integer", example: 6 }
        }
    },
    PaginationMeta: {
        type: "object",
        required: ["page", "limit", "totalRecords", "totalPages"],
        properties: {
            page: { type: "integer", minimum: 1, example: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, example: 10 },
            totalRecords: { type: "integer", example: 100 },
            totalPages: { type: "integer", example: 10 }
        }
    },
    StudentWriteResponse: {
        type: "object",
        required: ["id", "name", "age"],
        properties: {
            id: { type: "integer", example: 8 },
            name: { type: "string", example: "John Doe" },
            age: { type: "integer", example: 21 },
            course_id: { type: "integer", nullable: true, example: 6 }
        }
    },
    UpdateStudentRequest: {
        type: "object",
        minProperties: 1,
        properties: {
            name: { type: "string", minLength: 3, maxLength: 50, example: "Jane Doe" },
            age: { type: "integer", minimum: 16, maximum: 100, example: 22 },
            course_id: { type: "integer", nullable: true, example: 6 }
        }
    }
};
