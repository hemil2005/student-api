export default {
    "/users/register": {
        "post": {
            "tags": [
                "Users"
            ],
            "operationId": "registerUser",
            "summary": "Register a new user",
            "description": "Creates a user account with the default role 'user'. Rate limited to 5 requests per 15 minutes per IP.",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "$ref": "#/components/schemas/RegisterRequest"
                        },
                        "example": {
                            "name": "New User",
                            "email": "newuser@example.com",
                            "password": "secret123"
                        }
                    }
                }
            },
            "responses": {
                "201": {
                    "description": "User registered successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/User"
                            },
                            "example": {
                                "id": 4,
                                "name": "New User",
                                "email": "newuser@example.com",
                                "role": "user",
                                "created_at": "2026-08-26T10:00:00.000Z"
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
                                "message": "email: Invalid email address"
                            }
                        }
                    }
                },
                "409": {
                    "description": "User already exists",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 409,
                                "message": "User already exists"
                            }
                        }
                    }
                },
                "429": {
                    "description": "Too many registration attempts",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 429,
                                "message": "Too many requests from this IP, please try again later"
                            }
                        }
                    }
                }
            }
        }
    },
    "/users/login": {
        "post": {
            "tags": [
                "Users"
            ],
            "operationId": "loginUser",
            "summary": "Log in a user",
            "description": "Authenticates a user and returns an access token, a refresh token, and the user object. Rate limited to 10 requests per 15 minutes per IP.",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "$ref": "#/components/schemas/LoginRequest"
                        },
                        "example": {
                            "email": "hemil2@gmail.com",
                            "password": "123456"
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Login successful",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/LoginResponse"
                            },
                            "example": {
                                "token": "<access JWT>",
                                "refresh_token": "<refresh JWT>",
                                "user": {
                                    "id": 1,
                                    "name": "Test Admin",
                                    "email": "hemil2@gmail.com",
                                    "role": "admin"
                                }
                            }
                        }
                    }
                },
                "401": {
                    "description": "Invalid credentials",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 401,
                                "message": "Invalid email or password"
                            }
                        }
                    }
                },
                "429": {
                    "description": "Too many login attempts",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 429,
                                "message": "Too many requests from this IP, please try again later"
                            }
                        }
                    }
                }
            }
        }
    },
    "/users/make-admin/{id}": {
        "put": {
            "tags": [
                "Users"
            ],
            "operationId": "grantAdminAccess",
            "summary": "Grant admin access to a user",
            "description": "Promotes an existing user to the 'admin' role. Requires admin or superadmin. Rate limited to 5 requests per hour per IP.",
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
                    "description": "The ID of the user to promote"
                }
            ],
            "responses": {
                "200": {
                    "description": "Admin access granted successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "message": {
                                        "type": "string",
                                        "example": "Admin access granted successfully"
                                    },
                                    "user": {
                                        "$ref": "#/components/schemas/User"
                                    }
                                }
                            },
                            "example": {
                                "message": "Admin access granted successfully",
                                "user": {
                                    "id": 4,
                                    "name": "New User",
                                    "email": "newuser@example.com",
                                    "role": "admin"
                                }
                            }
                        }
                    }
                },
                "400": {
                    "description": "Invalid user ID",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ApiError"
                            },
                            "example": {
                                "status": "error",
                                "message": "Invalid user ID"
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
                    "description": "Caller is not admin or superadmin, or lacks permission",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 403,
                                "message": "You are not authorized to perform this action"
                            }
                        }
                    }
                },
                "404": {
                    "description": "User not found",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 404,
                                "message": "User not found"
                            }
                        }
                    }
                },
                "409": {
                    "description": "User is already an admin",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 409,
                                "message": "User is already an admin"
                            }
                        }
                    }
                },
                "429": {
                    "description": "Too many requests",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 429,
                                "message": "Too many requests from this IP, please try again later"
                            }
                        }
                    }
                }
            }
        }
    },
    "/users/auth/refresh": {
        "post": {
            "tags": [
                "Users"
            ],
            "operationId": "refreshToken",
            "summary": "Refresh access token",
            "description": "Exchanges a valid refresh token for a new access/refresh token pair (rotated). The used refresh token is revoked. Rate limited to 5 requests per 15 minutes per IP.",
            "requestBody": {
                "required": true,
                "content": {
                    "application/json": {
                        "schema": {
                            "$ref": "#/components/schemas/RefreshTokenRequest"
                        },
                        "example": {
                            "refresh_token": "<refresh JWT>"
                        }
                    }
                }
            },
            "responses": {
                "200": {
                    "description": "Token refreshed successfully",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/RefreshTokenResponse"
                            },
                            "example": {
                                "status": "success",
                                "token": "<new access JWT>",
                                "refresh_token": "<new refresh JWT>"
                            }
                        }
                    }
                },
                "401": {
                    "description": "Missing, invalid, expired, or revoked refresh token",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "examples": {
                                "missing": {
                                    "value": {
                                        "status": "fail",
                                        "statusCode": 401,
                                        "message": "Refresh token is required"
                                    }
                                },
                                "expiredOrInvalid": {
                                    "value": {
                                        "status": "fail",
                                        "statusCode": 401,
                                        "message": "Invalid or expired refresh token"
                                    }
                                },
                                "mismatch": {
                                    "value": {
                                        "status": "fail",
                                        "statusCode": 401,
                                        "message": "Refresh token mismatch — please log in again"
                                    }
                                }
                            }
                        }
                    }
                },
                "429": {
                    "description": "Too many refresh attempts",
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/ErrorResponse"
                            },
                            "example": {
                                "status": "fail",
                                "statusCode": 429,
                                "message": "Too many requests from this IP, please try again later"
                            }
                        }
                    }
                }
            }
        }
    }
};
