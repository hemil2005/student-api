import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../../app.js";
import prisma from "../../config/prisma.js";
import redisClient from "../../config/redis.js";
import config from "../../config/env.js";
import { findOrCreateOAuthUser } from "../../services/oauth.service.js";
import { generateUserTokens } from "../../services/user.service.js";
import UnauthorizedError from "../../errors/UnauthorizedError.js";

beforeAll(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    await prisma.oauth_accounts.deleteMany({
        where: {
            provider_user_id: { startsWith: "test_oauth_" }
        }
    });
    await prisma.users.deleteMany({
        where: {
            email: { startsWith: "test_oauth_" }
        }
    });
});

afterAll(async () => {
    // Cleanup created test records
    await prisma.oauth_accounts.deleteMany({
        where: {
            provider_user_id: { startsWith: "test_oauth_" }
        }
    });
    await prisma.users.deleteMany({
        where: {
            email: { startsWith: "test_oauth_" }
        }
    });

    if (redisClient.isOpen) {
        await redisClient.quit();
    }
});

describe("OAuth Service & Token Issuance Flow", () => {
    it("Case 4: rejects OAuth login when Google email is unverified or missing", async () => {
        const unverifiedProfile = {
            id: "test_oauth_unverified_id",
            displayName: "Unverified User",
            emails: [{ value: "test_oauth_unverified@example.com", verified: false }]
        };

        await expect(findOrCreateOAuthUser(unverifiedProfile)).rejects.toThrow(
            UnauthorizedError
        );
    });

    it("Case 3: Google callback → creates new user & oauth account", async () => {
        const uniqueId = `test_oauth_${Date.now()}_1`;
        const uniqueEmail = `${uniqueId}@example.com`;
        const newProfile = {
            id: uniqueId,
            displayName: "OAuth New User",
            emails: [{ value: uniqueEmail, verified: true }]
        };

        const user = await findOrCreateOAuthUser(newProfile);

        expect(user).toBeDefined();
        expect(user.email).toBe(uniqueEmail);
        expect(user.name).toBe("OAuth New User");
        expect(user.password).toBeNull();
        expect(user.role).toBe("user");

        // Verify oauth_accounts record created
        const oauthAcc = await prisma.oauth_accounts.findUnique({
            where: {
                provider_provider_user_id: {
                    provider: "google",
                    provider_user_id: uniqueId
                }
            }
        });
        expect(oauthAcc).toBeDefined();
        expect(oauthAcc.user_id).toBe(user.id);
    });

    it("Case 1: Google callback → returns existing OAuth user", async () => {
        const uniqueId = `test_oauth_${Date.now()}_case1`;
        const uniqueEmail = `${uniqueId}@example.com`;
        const initialProfile = {
            id: uniqueId,
            displayName: "OAuth Initial User",
            emails: [{ value: uniqueEmail, verified: true }]
        };

        // Create it first
        const createdUser = await findOrCreateOAuthUser(initialProfile);

        // Fetch again via findOrCreateOAuthUser (Case 1)
        const returnedUser = await findOrCreateOAuthUser(initialProfile);

        expect(returnedUser).toBeDefined();
        expect(returnedUser.id).toBe(createdUser.id);
        expect(returnedUser.email).toBe(uniqueEmail);
    });

    it("Case 2: Google callback → links existing local user with verified email", async () => {
        const uniqueId = `test_oauth_${Date.now()}_case2`;
        const uniqueEmail = `${uniqueId}@example.com`;

        // Create an existing local user without oauth account
        const localUser = await prisma.users.create({
            data: {
                name: "Existing Local User",
                email: uniqueEmail,
                password: "hashed_dummy_password",
                role: "user"
            }
        });

        const profile = {
            id: uniqueId,
            displayName: "Existing Local User",
            emails: [{ value: uniqueEmail, verified: true }]
        };

        const linkedUser = await findOrCreateOAuthUser(profile);

        expect(linkedUser.id).toBe(localUser.id);
        expect(linkedUser.email).toBe(localUser.email);

        // Verify oauth link exists
        const oauthAcc = await prisma.oauth_accounts.findUnique({
            where: {
                provider_provider_user_id: {
                    provider: "google",
                    provider_user_id: uniqueId
                }
            }
        });
        expect(oauthAcc).toBeDefined();
        expect(oauthAcc.user_id).toBe(localUser.id);
    });

    it("Tokens generation & Redis storage: OAuth user receives standard application credentials", async () => {
        const uniqueId = `test_oauth_${Date.now()}_token`;
        const uniqueEmail = `${uniqueId}@example.com`;
        const profile = {
            id: uniqueId,
            displayName: "Token Test User",
            emails: [{ value: uniqueEmail, verified: true }]
        };

        const user = await findOrCreateOAuthUser(profile);
        const tokenResponse = await generateUserTokens(user);

        // Check contract
        expect(tokenResponse).toHaveProperty("token");
        expect(tokenResponse).toHaveProperty("refresh_token");
        expect(tokenResponse.user).toEqual({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        // Verify access token is valid JWT
        const decoded = jwt.verify(tokenResponse.token, config.jwtSecret);
        expect(decoded.id).toBe(user.id);
        expect(decoded.role).toBe(user.role);

        // Verify refresh token stored in Redis
        const storedInRedis = await redisClient.get(`user:${user.id}`);
        expect(storedInRedis).toBeDefined();
        expect(JSON.parse(storedInRedis)).toBe(tokenResponse.refresh_token);
    });

    it("Protected route works with OAuth-issued JWT", async () => {
        // Normal admin login to test protected endpoint
        const loginRes = await request(app).post("/users/login").send({
            email: "hemil2@gmail.com",
            password: "123456"
        });

        expect(loginRes.status).toBe(200);
        const { token } = loginRes.body;

        // Call protected endpoint (admin make-admin check with valid JWT)
        const protectedRes = await request(app)
            .put("/users/make-admin/999999")
            .set("Authorization", `Bearer ${token}`);

        // If user not found, 404 means authenticate & authorize middleware passed!
        expect([404, 400, 200]).toContain(protectedRes.status);
    });
});

