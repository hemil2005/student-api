import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: Number(process.env.PORT) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    nodeEnv: process.env.NODE_ENV || "development",
    databaseUrl: process.env.DATABASE_URL,
    db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    redis: {
        url: process.env.REDIS_URL,
    }
}

const checkConfig = () => {
    const missingKeys = [];
    if (!config.jwtSecret) missingKeys.push("JWT_SECRET");
    if (!config.jwtRefreshSecret) missingKeys.push("JWT_REFRESH_SECRET");
    if (!config.databaseUrl) missingKeys.push("DATABASE_URL");

    if (missingKeys.length > 0) {
        throw new Error(`Missing required environment variables: ${missingKeys.join(", ")}`);
    }
}

checkConfig();

export default config;