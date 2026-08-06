import { PrismaClient } from "@prisma/client";
import logger from "../logger/logger.js";

if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
    logger.info("Prisma client created");
} else {
    logger.info("Using existing prisma client");
}

export default globalThis.prisma;