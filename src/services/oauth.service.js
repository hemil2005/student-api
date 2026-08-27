import prisma from "../config/prisma.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";
import logger from "../logger/logger.js";

/**
 * Finds or creates a user associated with an OAuth profile.
 * 
 * Cases:
 * 1. Existing OAuth account -> return associated user.
 * 2. No OAuth account + verified email matches existing user -> create oauth_account link and return user.
 * 3. No OAuth account + no local user -> create user & oauth_account link and return user.
 * 4. Google email isn't verified -> reject with UnauthorizedError.
 * 
 * @param {object} profile - Google OAuth profile object
 * @returns {Promise<object>} User record
 */
export async function findOrCreateOAuthUser(profile) {
    const provider = "google";
    const providerUserId = profile.id;

    // Case 1: Existing OAuth account
    const existingOAuthAccount = await prisma.oauth_accounts.findUnique({
        where: {
            provider_provider_user_id: {
                provider,
                provider_user_id: providerUserId
            }
        },
        include: {
            user: true
        }
    });

    if (existingOAuthAccount) {
        logger.info(`Found existing OAuth account for user ID: ${existingOAuthAccount.user.id}`);
        return existingOAuthAccount.user;
    }

    // Extract email and verification status
    const emailObj = profile.emails?.[0];
    const email = emailObj?.value || profile.email;
    const isVerified =
        emailObj?.verified === true ||
        emailObj?.verified === "true" ||
        profile._json?.email_verified === true ||
        profile._json?.email_verified === "true";

    // Case 4: Google email isn't verified or is missing
    if (!email || !isVerified) {
        logger.warn("OAuth login rejected: Google email is missing or unverified");
        throw new UnauthorizedError("Google email is not verified");
    }

    // Check if a local user already exists with this verified email
    let user = await prisma.users.findUnique({
        where: { email }
    });

    // Case 2: No OAuth account + verified email matches existing user
    if (user) {
        logger.info(`Linking new OAuth provider to existing user ID: ${user.id}`);
        await prisma.oauth_accounts.create({
            data: {
                user_id: user.id,
                provider,
                provider_user_id: providerUserId
            }
        });
        return user;
    }

    // Case 3: No OAuth account + no local user
    logger.info(`Creating new user and OAuth account for email: ${email}`);
    user = await prisma.users.create({
        data: {
            name: profile.displayName || email.split("@")[0],
            email,
            password: null,
            role: "user",
            oauthAccounts: {
                create: {
                    provider,
                    provider_user_id: providerUserId
                }
            }
        }
    });

    return user;
}