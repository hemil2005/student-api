export default {
    Course: {
        type: "object",
        required: ["id", "name"],
        properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", minLength: 3, maxLength: 50, example: "Computer Science" }
        }
    },
    CourseWithStudents: {
        allOf: [
            { $ref: "#/components/schemas/Course" },
            {
                type: "object",
                properties: {
                    students: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Student" }
                    }
                }
            }
        ]
    },
    CreateCourseRequest: {
        type: "object",
        required: ["name"],
        properties: {
            name: { type: "string", minLength: 3, maxLength: 50, example: "Information Technology" }
        }
    },
    UpdateCourseRequest: {
        type: "object",
        required: ["name"],
        properties: {
            name: { type: "string", minLength: 3, maxLength: 50, example: "Mechanical Engineering" }
        }
    }
};
