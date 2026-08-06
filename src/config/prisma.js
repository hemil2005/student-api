import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import logger from "../logger/logger.js";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({ adapter });
    logger.info("Prisma client created");
} else {
    logger.info("Using existing prisma client");
}

export default globalThis.prisma;