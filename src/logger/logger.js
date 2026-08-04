import pino from "pino";

const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            destination: './logs/error.log',
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        },
    },
});


export default logger;