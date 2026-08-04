import pino from "pino";
import fs from "fs";
import path from "path";

// Ensure the logs directory exists
const logsDir = path.resolve('../../', "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
// Ensure log files exist
const errorLogPath = path.join(logsDir, "error.log");
const appLogPath = path.join(logsDir, "app.log");
if (!fs.existsSync(errorLogPath)) {
    fs.writeFileSync(errorLogPath, "");
}
if (!fs.existsSync(appLogPath)) {
    fs.writeFileSync(appLogPath, "");
}
/**
 * Error logger – writes error level logs to `logs/error.log` and the console.
 */
const errorLogger = pino({
    level: 'error',
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    destination: './logs/error.log',
                    colorize: false, // no ANSI codes in file
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname'
                }
            },
            {
                target: 'pino-pretty',
                options: {
                    colorize: true, // console output
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname'
                }
            }
        ]
    }
});

/**
 * Info logger – writes informational logs to `logs/app.log` and the console.
 * Use this for general application activity tracking.
 */
const infoLogger = pino({
    level: 'info',
    transport: {
        targets: [
            {
                target: 'pino-pretty',
                options: {
                    destination: './logs/app.log',
                    colorize: false, // plain file output
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname'
                }
            },
            {
                target: 'pino-pretty',
                options: {
                    colorize: true, // console output
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname'
                }
            }
        ]
    }
});

// Example usage – you can remove these lines in production
errorLogger.info("Error logger is initialized");
infoLogger.info("Info logger is initialized");

export default { errorLogger, infoLogger };
export { errorLogger, infoLogger };