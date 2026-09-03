import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl:
        process.env.NODE_ENV === "test"
            ? process.env.DATABASE_URL_TEST
            : process.env.DATABASE_URL,
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL
    },
    redis: {
        url:
            process.env.NODE_ENV === "test"
                ? process.env.REDIS_URL_TEST
                : process.env.REDIS_URL,
    },
    swagger: {
        autoAuthEmail: process.env.SWAGGER_AUTO_AUTH_EMAIL,
        autoAuthPassword: process.env.SWAGGER_AUTO_AUTH_PASSWORD,
    }
}

const checkConfig = () => {
    const missingKeys = [];
    if (!config.jwtSecret) missingKeys.push("JWT_SECRET");
    if (!config.jwtRefreshSecret) missingKeys.push("JWT_REFRESH_SECRET");
    if (config.nodeEnv === "test" && !process.env.DATABASE_URL_TEST) {
        missingKeys.push("DATABASE_URL_TEST");
    } else if (config.nodeEnv !== "test" && !config.databaseUrl) {
        missingKeys.push("DATABASE_URL");
    }
    if (config.nodeEnv === "test" && !process.env.REDIS_URL_TEST) {
        missingKeys.push("REDIS_URL_TEST");
    } else if (config.nodeEnv !== "test" && !config.redis.url) {
        missingKeys.push("REDIS_URL");
    }

    const hasAnyGoogleKey = Boolean(
        config.google.clientId ||
        config.google.clientSecret ||
        config.google.callbackUrl
    );
    if (hasAnyGoogleKey) {
        if (!config.google.clientId) missingKeys.push("GOOGLE_CLIENT_ID");
        if (!config.google.clientSecret) missingKeys.push("GOOGLE_CLIENT_SECRET");
        if (!config.google.callbackUrl) missingKeys.push("GOOGLE_CALLBACK_URL");
    }

    if (missingKeys.length > 0) {
        throw new Error(`Missing required environment variables: ${missingKeys.join(", ")}`);
    }
}

checkConfig();

export default config;