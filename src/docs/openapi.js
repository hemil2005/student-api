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
            },
            post: {
                summary: "Create a new student",
                description: "Creates a student and writes a creation log entry. Requires all fields; duplicates (same name, age, and course) are rejected.",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["name", "age", "course_id"],
                                properties: {
                                    name: {
                                        type: "string",
                                        minLength: 3,
                                        maxLength: 50
                                    },
                                    age: {
                                        type: "integer",
                                        minimum: 16,
                                        maximum: 100
                                    },
                                    course_id: {
                                        type: "integer"
                                    }
                                },
                                example: {
                                    name: "John Doe",
                                    age: 21,
                                    course_id: 6
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "Student created successfully",
                        content: {
                            "application/json": {
                                example: {
                                    status: "success",
                                    data: {
                                        id: 9,
                                        name: "John Doe",
                                        age: 21,
                                        course_id: 6
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        description: "Validation failed",
                        content: {
                            "application/json": {
                                example: {
                                    status: "fail",
                                    statusCode: 400,
                                    message: "name: String must contain at least 3 character(s), age: Number must be greater than or equal to 16"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required"
                    },
                    "403": {
                        description: "Insufficient permissions"
                    },
                    "409": {
                        description: "Student already exists",
                        content: {
                            "application/json": {
                                example: {
                                    status: "fail",
                                    statusCode: 409,
                                    message: "Student already exists"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/students/{id}": {
            get: {
                summary: "Get a student by ID",
                description: "Returns a single student by their ID.",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "The ID of the student"
                    }
                ],
                responses: {
                    "200": {
                        description: "Student retrieved successfully",
                        content: {
                            "application/json": {
                                example: {
                                    status: "success",
                                    data: {
                                        id: 8,
                                        name: "John Doe",
                                        age: 21,
                                        course_id: 6,
                                        courses: {
                                            id: 6,
                                            name: "Information Technology"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid student ID",
                        content: {
                            "application/json": {
                                example: {
                                    status: "error",
                                    message: "Invalid student ID"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required"
                    },
                    "403": {
                        description: "Insufficient permissions"
                    },
                    "404": {
                        description: "Student not found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "fail",
                                    statusCode: 404,
                                    message: "Student not found"
                                }
                            }
                        }
                    }
                }
            },
            patch: {
                summary: "Update an existing student",
                description: "Partially updates a student. Only the provided fields are changed; all fields are optional but validated when present. Invalidates the cached student.",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "The ID of the student"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: {
                                        type: "string",
                                        minLength: 3,
                                        maxLength: 50
                                    },
                                    age: {
                                        type: "integer",
                                        minimum: 16,
                                        maximum: 100
                                    },
                                    course_id: {
                                        type: "integer"
                                    }
                                },
                                example: {
                                    age: 22
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Student updated successfully",
                        content: {
                            "application/json": {
                                example: {
                                    status: "success",
                                    data: {
                                        id: 8,
                                        name: "John Doe",
                                        age: 22,
                                        course_id: 6
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid student ID or validation failed",
                        content: {
                            "application/json": {
                                examples: {
                                    invalidId: {
                                        value: {
                                            status: "error",
                                            message: "Invalid student ID"
                                        }
                                    },
                                    validationFailed: {
                                        value: {
                                            status: "fail",
                                            statusCode: 400,
                                            message: "name: String must contain at least 3 character(s)"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required"
                    },
                    "403": {
                        description: "Insufficient permissions"
                    },
                    "404": {
                        description: "Student not found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "fail",
                                    statusCode: 404,
                                    message: "Student not found"
                                }
                            }
                        }
                    }
                }
            },
            delete: {
                summary: "Delete a student",
                description: "Deletes a student by ID and invalidates the cached student. Associated student logs are removed by cascade.",
                security: [
                    {
                        bearerAuth: []
                    }
                ],
                parameters: [
                    {
                        name: "id",
                        in: "path",
                        required: true,
                        schema: {
                            type: "integer",
                            minimum: 1
                        },
                        description: "The ID of the student"
                    }
                ],
                responses: {
                    "200": {
                        description: "Student deleted successfully",
                        content: {
                            "application/json": {
                                example: {
                                    status: "success",
                                    data: {
                                        id: 8,
                                        name: "John Doe",
                                        age: 21,
                                        course_id: 6
                                    }
                                }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid student ID",
                        content: {
                            "application/json": {
                                example: {
                                    status: "error",
                                    message: "Invalid student ID"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required"
                    },
                    "403": {
                        description: "Insufficient permissions"
                    },
                    "404": {
                        description: "Student not found",
                        content: {
                            "application/json": {
                                example: {
                                    status: "fail",
                                    statusCode: 404,
                                    message: "Student not found"
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