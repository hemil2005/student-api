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
        "/students": {
            get: {
                tags: ["Students"],
                operationId: "listStudents",
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
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Student" }
                                        },
                                        meta: { $ref: "#/components/schemas/PaginationMeta" }
                                    }
                                },
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
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Students"],
                operationId: "createStudent",
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
                                $ref: "#/components/schemas/CreateStudentRequest"
                            },
                            example: {
                                name: "John Doe",
                                age: 21,
                                course_id: 6
                            }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "Student created successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        data: { $ref: "#/components/schemas/StudentWriteResponse" }
                                    }
                                },
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
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 400,
                                    message: "name: String must contain at least 3 character(s), age: Number must be greater than or equal to 16"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "409": {
                        description: "Student already exists",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
                tags: ["Students"],
                operationId: "getStudentById",
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
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        data: { $ref: "#/components/schemas/Student" }
                                    }
                                },
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
                                schema: { $ref: "#/components/schemas/ApiError" },
                                example: {
                                    status: "error",
                                    message: "Invalid student ID"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "404": {
                        description: "Student not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
                tags: ["Students"],
                operationId: "updateStudent",
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
                            schema: { $ref: "#/components/schemas/UpdateStudentRequest" },
                            example: { age: 22 }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Student updated successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        data: { $ref: "#/components/schemas/StudentWriteResponse" }
                                    }
                                },
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
                                schema: {
                                    oneOf: [
                                        { $ref: "#/components/schemas/ApiError" },
                                        { $ref: "#/components/schemas/ErrorResponse" }
                                    ]
                                },
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
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "404": {
                        description: "Student not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
                tags: ["Students"],
                operationId: "deleteStudent",
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
                                schema: {
                                    type: "object",
                                    properties: {
                                        status: { type: "string", example: "success" },
                                        data: { $ref: "#/components/schemas/StudentWriteResponse" }
                                    }
                                },
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
                                schema: { $ref: "#/components/schemas/ApiError" },
                                example: {
                                    status: "error",
                                    message: "Invalid student ID"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "404": {
                        description: "Student not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
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
        },
        "/courses": {
            get: {
                tags: ["Courses"],
                operationId: "listCourses",
                summary: "List all courses",
                description: "Returns all courses. Requires course:read permission.",
                security: [{ bearerAuth: [] }],
                responses: {
                    "200": {
                        description: "Courses retrieved successfully",
                        content: {
                            "application/json": {
                                schema: { type: "array", items: { $ref: "#/components/schemas/Course" } },
                                example: [
                                    { id: 1, name: "Computer Science" },
                                    { id: 6, name: "Information Technology" }
                                ]
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Courses"],
                operationId: "createCourse",
                summary: "Create a new course",
                description: "Creates a course. Name must be unique. Requires course:create permission.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/CreateCourseRequest" },
                            example: { name: "Data Science" }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "Course created successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Course created successfully" },
                                        data: { $ref: "#/components/schemas/Course" }
                                    }
                                },
                                example: { message: "Course created successfully", data: { id: 7, name: "Data Science" } }
                            }
                        }
                    },
                    "400": {
                        description: "Validation failed",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 400, message: "name: String must contain at least 3 character(s)" }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "409": {
                        description: "Course already exists",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 409, message: "Course already exists" }
                            }
                        }
                    }
                }
            }
        },
        "/courses/{id}": {
            get: {
                tags: ["Courses"],
                operationId: "getCourseById",
                summary: "Get a course by ID",
                description: "Returns a single course with its enrolled students.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "The ID of the course" }
                ],
                responses: {
                    "200": {
                        description: "Course retrieved successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/CourseWithStudents" },
                                example: { id: 6, name: "Information Technology", students: [{ id: 8, name: "John Doe", age: 21, course_id: 6 }] }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid course ID",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ApiError" },
                                example: { status: "error", message: "Invalid course ID" }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "404": {
                        description: "Course not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 404, message: "Course not found" }
                            }
                        }
                    }
                }
            },
            patch: {
                tags: ["Courses"],
                operationId: "updateCourse",
                summary: "Update a course",
                description: "Updates a course name. Requires course:update permission.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "The ID of the course" }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/UpdateCourseRequest" },
                            example: { name: "Mechanical Engineering" }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Course updated successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Course" },
                                example: { id: 6, name: "Mechanical Engineering" }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid course ID or validation failed",
                        content: {
                            "application/json": {
                                schema: {
                                    oneOf: [{ $ref: "#/components/schemas/ApiError" }, { $ref: "#/components/schemas/ErrorResponse" }]
                                },
                                examples: {
                                    invalidId: { value: { status: "error", message: "Invalid course ID" } },
                                    validationFailed: { value: { status: "fail", statusCode: 400, message: "name: String must contain at least 3 character(s)" } }
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "404": {
                        description: "Course not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 404, message: "Course not found" }
                            }
                        }
                    }
                }
            },
            delete: {
                tags: ["Courses"],
                operationId: "deleteCourse",
                summary: "Delete a course",
                description: "Deletes a course by ID.",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 }, description: "The ID of the course" }
                ],
                responses: {
                    "200": {
                        description: "Course deleted successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Course" },
                                example: { id: 6, name: "Information Technology" }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid course ID",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ApiError" },
                                example: { status: "error", message: "Invalid course ID" }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Insufficient permissions",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 403, message: "Insufficient permissions" }
                            }
                        }
                    },
                    "404": {
                        description: "Course not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 404, message: "Course not found" }
                            }
                        }
                    }
                }
            }
        },
        "/users/register": {
            post: {
                tags: ["Users"],
                operationId: "registerUser",
                summary: "Register a new user",
                description: "Creates a user account with the default role 'user'. Rate limited to 5 requests per 15 minutes per IP.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/RegisterRequest" },
                            example: { name: "New User", email: "newuser@example.com", password: "secret123" }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "User registered successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" },
                                example: {
                                    id: 4,
                                    name: "New User",
                                    email: "newuser@example.com",
                                    role: "user",
                                    created_at: "2026-08-26T10:00:00.000Z"
                                }
                            }
                        }
                    },
                    "400": {
                        description: "Validation failed",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 400,
                                    message: "email: Invalid email address"
                                }
                            }
                        }
                    },
                    "409": {
                        description: "User already exists",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 409,
                                    message: "User already exists"
                                }
                            }
                        }
                    },
                    "429": {
                        description: "Too many registration attempts",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 429,
                                    message: "Too many requests from this IP, please try again later"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/users/login": {
            post: {
                tags: ["Users"],
                operationId: "loginUser",
                summary: "Log in a user",
                description: "Authenticates a user and returns an access token, a refresh token, and the user object. Rate limited to 10 requests per 15 minutes per IP.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/LoginRequest" },
                            example: { email: "hemil2@gmail.com", password: "123456" }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Login successful",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/LoginResponse" },
                                example: {
                                    token: "<access JWT>",
                                    refresh_token: "<refresh JWT>",
                                    user: { id: 1, name: "Test Admin", email: "hemil2@gmail.com", role: "admin" }
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Invalid credentials",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 401,
                                    message: "Invalid email or password"
                                }
                            }
                        }
                    },
                    "429": {
                        description: "Too many login attempts",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 429,
                                    message: "Too many requests from this IP, please try again later"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/users/make-admin/{id}": {
            put: {
                tags: ["Users"],
                operationId: "grantAdminAccess",
                summary: "Grant admin access to a user",
                description: "Promotes an existing user to the 'admin' role. Requires admin or superadmin. Rate limited to 5 requests per hour per IP.",
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
                        description: "The ID of the user to promote"
                    }
                ],
                responses: {
                    "200": {
                        description: "Admin access granted successfully",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        message: { type: "string", example: "Admin access granted successfully" },
                                        user: { $ref: "#/components/schemas/User" }
                                    }
                                },
                                example: {
                                    message: "Admin access granted successfully",
                                    user: { id: 4, name: "New User", email: "newuser@example.com", role: "admin" }
                                }
                            }
                        }
                    },
                    "400": {
                        description: "Invalid user ID",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ApiError" },
                                example: {
                                    status: "error",
                                    message: "Invalid user ID"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Authentication required",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: { status: "fail", statusCode: 401, message: "Unauthorized" }
                            }
                        }
                    },
                    "403": {
                        description: "Caller is not admin or superadmin, or lacks permission",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 403,
                                    message: "You are not authorized to perform this action"
                                }
                            }
                        }
                    },
                    "404": {
                        description: "User not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 404,
                                    message: "User not found"
                                }
                            }
                        }
                    },
                    "409": {
                        description: "User is already an admin",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 409,
                                    message: "User is already an admin"
                                }
                            }
                        }
                    },
                    "429": {
                        description: "Too many requests",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 429,
                                    message: "Too many requests from this IP, please try again later"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/users/auth/refresh": {
            post: {
                tags: ["Users"],
                operationId: "refreshToken",
                summary: "Refresh access token",
                description: "Exchanges a valid refresh token for a new access/refresh token pair (rotated). The used refresh token is revoked. Rate limited to 5 requests per 15 minutes per IP.",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/RefreshTokenRequest" },
                            example: { refresh_token: "<refresh JWT>" }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Token refreshed successfully",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/RefreshTokenResponse" },
                                example: {
                                    status: "success",
                                    token: "<new access JWT>",
                                    refresh_token: "<new refresh JWT>"
                                }
                            }
                        }
                    },
                    "401": {
                        description: "Missing, invalid, expired, or revoked refresh token",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                examples: {
                                    missing: {
                                        value: {
                                            status: "fail",
                                            statusCode: 401,
                                            message: "Refresh token is required"
                                        }
                                    },
                                    expiredOrInvalid: {
                                        value: {
                                            status: "fail",
                                            statusCode: 401,
                                            message: "Invalid or expired refresh token"
                                        }
                                    },
                                    mismatch: {
                                        value: {
                                            status: "fail",
                                            statusCode: 401,
                                            message: "Refresh token mismatch — please log in again"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "429": {
                        description: "Too many refresh attempts",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ErrorResponse" },
                                example: {
                                    status: "fail",
                                    statusCode: 429,
                                    message: "Too many requests from this IP, please try again later"
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
        },
        schemas: {
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
            },
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
            },
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
            },
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
        }
    }
};

export default openapiSpecification;