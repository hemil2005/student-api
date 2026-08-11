import { createClient } from "redis";
import logger from "../logger/logger.js";
import config from "./env.js";

const redisClient = createClient({
    url: config.redis.url
});

redisClient.on("connect", () => {
    logger.info("Redis client connected");
});

redisClient.on("error", (err) => {
    logger.error(`Redis client error ${err}`);
    // Do NOT throw here — throwing inside an event listener becomes an
    // unhandled exception. The redis client handles reconnection internally.
});

redisClient.on("end", () => {
    logger.info("Redis client disconnected");
});

export default redisClient;