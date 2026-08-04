import pino from "pino";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the logs directory exists
const logsDir = path.resolve(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}
// Pino will create files automatically

/**
 * Error logger – writes error level logs to `logs/error.log` and the console.
 */

const logger = pino({
    level: process.env.NODE_ENV === "production" ? "error" : "info",
    transport: {
        targets: [
            {
                target: "pino-pretty",
                level: "info",
                options: {
                    colorize: true,
                    //translateTime: "SYS:standard",
                }
            },
            {
                target: "pino/file",
                level: "info",
                options: {
                    destination: path.join(logsDir, "app.log"),
                    colorize: false,
                    //translateTime: "SYS:standard",
                    ignore: "pid,hostname"
                }
            },
            {
                target: "pino/file",
                level: "error",
                options: {
                    destination: path.join(logsDir, "error.log"),
                    colorize: false,
                    //translateTime: "SYS:standard",
                    ignore: "pid,hostname"
                }
            }
        ]
    }
})

// const errorLogger = pino({
//     level: 'error',
//     transport: {
//         targets: [
//             {
//                 target: 'pino-pretty',
//                 options: {
//                     destination: './logs/error.log',
//                     colorize: false, // no ANSI codes in file
//                     translateTime: 'SYS:standard',  
//                     ignore: 'pid,hostname'
//                 }
//             },
//             {
//                 target: 'pino-pretty',
//                 options: {
//                     colorize: true, // console output
//                     translateTime: 'SYS:standard',
//                     ignore: 'pid,hostname'
//                 }
//             }
//         ]
//     }
// });

// /**
//  * Info logger – writes informational logs to `logs/app.log` and the console.
//  * Use this for general application activity tracking.
//  */
// const infoLogger = pino({
//     level: 'info',
//     transport: {
//         targets: [
//             {
//                 target: 'pino-pretty',
//                 options: {
//                     destination: './logs/app.log',
//                     colorize: false, // plain file output
//                     translateTime: 'SYS:standard',
//                     ignore: 'pid,hostname'
//                 }
//             },
//             {
//                 target: 'pino-pretty',
//                 options: {
//                     colorize: true, // console output
//                     translateTime: 'SYS:standard',
//                     ignore: 'pid,hostname'
//                 }
//             }
//         ]
//     }
// });

// // Example usage – you can remove these lines in production
// errorLogger.info("Error logger is initialized");
// infoLogger.info("Info logger is initialized");

export default logger;