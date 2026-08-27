import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import config from "./env.js";
import { findOrCreateOAuthUser } from "../services/oauth.service.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackUrl
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const user = await findOrCreateOAuthUser(profile);

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

export default passport;