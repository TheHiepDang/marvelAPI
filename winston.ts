import winston = require("winston")
import * as dotenv from "dotenv";

dotenv.config();

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
