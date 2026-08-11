import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import logger from "../logger/logger.js";
import config from "./env.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: config.databaseUrl });
const adapter = new PrismaPg(pool);

if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({ adapter });
    logger.info("Prisma client created");
} else {
    logger.info("Using existing prisma client");
}

export default globalThis.prisma;