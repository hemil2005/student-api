import pino from "pino";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logs go to the project-root /logs folder (two levels up from src/logger)
const logsDir = path.resolve(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const appLogPath = path.join(logsDir, "app.log");
const errorLogPath = path.join(logsDir, "error.log");

/**
 * Shared pino-pretty format options for file output.
 * colorize: false  → no ANSI escape codes in the file
 * translateTime    → human-readable timestamp with timezone offset
 * singleLine: false → multi-line output (required for error objects)
 */
const filePrettyOptions = {
    colorize: false,
    translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l o",
    ignore: "pid",
    singleLine: false,
};

const logger = pino({
    level: process.env.NODE_ENV === "production" ? "error" : "info",
    transport: {
        targets: [
            // ── 1. Console – colored, all levels ──────────────────────────
            {
                target: "pino-pretty",
                level: "info",
                options: {
                    colorize: true,
                },
            },

            // ── 2. app.log – pretty, no color, info+ ──────────────────────
            {
                target: "pino-pretty",
                level: "info",
                options: {
                    ...filePrettyOptions,
                    destination: appLogPath,
                    append: true,
                },
            },

            // ── 3. error.log – pretty, no color, error only ────────────────
            {
                target: "pino-pretty",
                level: "error",
                options: {
                    ...filePrettyOptions,
                    destination: errorLogPath,
                    append: true,
                },
            },
        ],
    },
});

export default logger;