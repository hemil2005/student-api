const openapiSpecification = {
    openapi: "3.0.0",

    info: {
        title: "Student API",
        version: "1.0.0",
        description: "API documentation for the Student Management API"
    },

    servers: [
        {
            url: "http://localhost:3000"
        }
    ],

    paths: {
        "/students": {
            get: {
                summary: "Get all students",
                description: "Returns a paginated list of students with optional filtering, sorting, and searching.",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "page",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            default: 1
                        },
                        description: "Page number"
                    },
                    {
                        name: "limit",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1,
                            maximum: 100,
                            default: 10
                        },
                        description: "Number of students per page"
                    },
                    {
                        name: "courseId",
                        in: "query",
                        required: false,
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "Filter students by course ID"
                    },
                    {
                        name: "sort",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            example: "-name"
                        },
                        description: "Sort by id, name, or age. Prefix with '-' for descending order."
                    },
                    {
                        name: "search",
                        in: "query",
                        required: false,
                        schema: {
                            type: "string",
                            example: "Hemil"
                        },
                        description: "Search students by name"
                    }
                ],
                responses: {
                    "200": {
                        description: "Students retrieved successfully",
                        content: {
                            "application/json": {
                                example: {
                                    status: "success",
                                    data: [
                                        {
                                            id: 1,
                                            name: "Hemil",
                                            age: 20,
                                            course_id: 1,
                                            courses: {
                                                id: 1,
                                                name: "Computer Science"
                                            }
                                        }
                                    ],
                                    meta: {
                                        page: 1,
                                        limit: 10,
                                        totalRecords: 100,
                                        totalPages: 10
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
};

export default openapiSpecification;