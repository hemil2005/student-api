import studentPaths from "./paths/students.js";
import coursePaths from "./paths/courses.js";
import userPaths from "./paths/users.js";

import studentSchemas from "./schemas/students.js";
import courseSchemas from "./schemas/courses.js";
import userSchemas from "./schemas/users.js";
import commonSchemas from "./schemas/common.js";

const openapiSpecification = {
    openapi: "3.0.0",

    info: {
        title: "Student API",
        version: "1.0.0",
        description: "API documentation for the Student Management API"
    },

    servers: [
        {
            url: "/"
        }
    ],

    paths: {
        ...studentPaths,
        ...coursePaths,
        ...userPaths
    },

    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        },
        schemas: {
            ...studentSchemas,
            ...courseSchemas,
            ...userSchemas,
            ...commonSchemas
        }
    }
};

export default openapiSpecification;
