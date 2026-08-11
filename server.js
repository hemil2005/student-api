import app from './app.js';
import pool from './src/config/database.js';
import redisClient from './src/config/redis.js';
import config from './src/config/env.js';

async function start() {
    // Verify DB connection
    await pool.query("SELECT NOW();");

    // Connect Redis before the server starts accepting requests
    await redisClient.connect();

    app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
    });
}

start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});