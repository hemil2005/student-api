export default {
    "/courses": {
        "get": {
            "tags": [
                "Courses"
            ],
            "operationId": "listCourses",
            "summary": "List all courses",
            "description": "Returns all courses. Requires course:read permission.",
            "security": [
                {
                    "bearerAuth": []
                }
            ],
            "responses": {
                "200": {
                    "description": "Courses retrieved successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "array",
                                "items": {
                                    "$ref": "#/components/schemas/Course"
                                }
                            },
                            "example": [
                                {
                                    "id": 1,
                                    "name": "Computer Science"
                                },
                                {
                                    "id": 6,
                                    "name": "Information Technology"
                                }
                            ]
                        }
                    }
                },
                "401": {
                    "description": "Authentication required",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 401,
                                "message": "Unauthorized"
                            }
                        }
                    }
                },
                "403": {
                    "description": "Insufficient permissions",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 403,
                                "message": "Insufficient permissions"
                            }
                        }
                    }
                }
            }
        },
        "post": {
            "tags": [
                "Courses"
            ],
            "operationId": "createCourse",
            "summary": "Create a new course",
            "description": "Creates a course. Name must be unique. Requires course:create permission.",
            "security": [
                {
                    "bearerAuth": []
                }
            ],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "$ref": "#/components/schemas/CreateCourseRequest"
                        },
                        "example": {
                            "name": "Data Science"
                        }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "Course created successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "message": {
                                        "type": "string",
                                        "example": "Course created successfully"
                                    },
                                    "data": {
                                        "$ref": "#/components/schemas/Course"
                                    }
                                }
                            },
                            "example": {
                                "message": "Course created successfully",
                                "data": {
                                    "id": 7,
                                    "name": "Data Science"
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "Validation failed",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 400,
                                "message": "name: String must contain at least 3 character(s)"
                            }
                        }
                    }
                },
                "401": {
                    "description": "Authentication required",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 401,
                                "message": "Unauthorized"
                            }
                        }
                    }
                },
                "403": {
                    "description": "Insufficient permissions",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 403,
                                "message": "Insufficient permissions"
                            }
                        }
                    }
                },
                "409": {
                    "description": "Course already exists",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 409,
                                "message": "Course already exists"
                            }
                        }
                    }
                }
            }
        }
    },
    "/courses/{id}": {
        "get": {
            "tags": [
                "Courses"
            ],
            "operationId": "getCourseById",
            "summary": "Get a course by ID",
            "description": "Returns a single course with its enrolled students.",
            "security": [
                {
                    "bearerAuth": []
                }
            ],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "schema": {
                        "type": "integer",
                        "minimum": 1
                    },
                    "description": "The ID of the course"
                }
            ],
            "responses": {
                "200": {
                    "description": "Course retrieved successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CourseWithStudents"
                            },
                            "example": {
                                "id": 6,
                                "name": "Information Technology",
                                "students": [
                                    {
                                        "id": 8,
                                        "name": "John Doe",
                                        "age": 21,
                                        "course_id": 6
                                    }
                                ]
                            }
                        }
                    }
                },
                "400": {
                    "description": "Invalid course ID",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiError"
                            },
                            "example": {
                                "status": "error",
                                "message": "Invalid course ID"
                            }
                        }
                    }
                },
                "401": {
                    "description": "Authentication required",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 401,
                                "message": "Unauthorized"
                            }
                        }
                    }
                },
                "403": {
                    "description": "Insufficient permissions",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 403,
                                "message": "Insufficient permissions"
                            }
                        }
                    }
                },
                "404": {
                    "description": "Course not found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 404,
                                "message": "Course not found"
                            }
                        }
                    }
                }
            }
        },
        "patch": {
            "tags": [
                "Courses"
            ],
            "operationId": "updateCourse",
            "summary": "Update a course",
            "description": "Updates a course name. Requires course:update permission.",
            "security": [
                {
                    "bearerAuth": []
                }
            ],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "schema": {
                        "type": "integer",
                        "minimum": 1
                    },
                    "description": "The ID of the course"
                }
            ],
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "$ref": "#/components/schemas/UpdateCourseRequest"
                        },
                        "example": {
                            "name": "Mechanical Engineering"
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Course updated successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Course"
                            },
                            "example": {
                                "id": 6,
                                "name": "Mechanical Engineering"
                            }
                        }
                    }
                },
                "400": {
                    "description": "Invalid course ID or validation failed",
                    "content": {
                        "application/json": {
                            "schema": {
                                "oneOf": [
                                    {
                                        "$ref": "#/components/schemas/ApiError"
                                    },
                                    {
                                        "$ref": "#/components/schemas/ErrorResponse"
                                    }
                                ]
                            },
                            "examples": {
                                "invalidId": {
                                    "value": {
                                        "status": "error",
                                        "message": "Invalid course ID"
                                    }
                                },
                                "validationFailed": {
                                    "value": {
                                        "status": "fail",
                                        "statusCode": 400,
                                        "message": "name: String must contain at least 3 character(s)"
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Authentication required",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 401,
                                "message": "Unauthorized"
                            }
                        }
                    }
                },
                "403": {
                    "description": "Insufficient permissions",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 403,
                                "message": "Insufficient permissions"
                            }
                        }
                    }
                },
                "404": {
                    "description": "Course not found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 404,
                                "message": "Course not found"
                            }
                        }
                    }
                }
            }
        },
        "delete": {
            "tags": [
                "Courses"
            ],
            "operationId": "deleteCourse",
            "summary": "Delete a course",
            "description": "Deletes a course by ID.",
            "security": [
                {
                    "bearerAuth": []
                }
            ],
            "parameters": [
                {
                    "name": "id",
                    "in": "path",
                    "required": true,
                    "schema": {
                        "type": "integer",
                        "minimum": 1
                    },
                    "description": "The ID of the course"
                }
            ],
            "responses": {
                "200": {
                    "description": "Course deleted successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/Course"
                            },
                            "example": {
                                "id": 6,
                                "name": "Information Technology"
                            }
                        }
                    }
                },
                "400": {
                    "description": "Invalid course ID",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiError"
                            },
                            "example": {
                                "status": "error",
                                "message": "Invalid course ID"
                            }
                        }
                    }
                },
                "401": {
                    "description": "Authentication required",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 401,
                                "message": "Unauthorized"
                            }
                        }
                    }
                },
                "403": {
                    "description": "Insufficient permissions",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 403,
                                "message": "Insufficient permissions"
                            }
                        }
                    }
                },
                "404": {
                    "description": "Course not found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 404,
                                "message": "Course not found"
                            }
                        }
                    }
                }
            }
        }
    }
};
