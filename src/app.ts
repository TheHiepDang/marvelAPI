import * as dotenv from "dotenv";

import express, { Application } from 'express';

import swaggerUi from 'swagger-ui-express';
import { routes } from './routes';
import swaggerDocs from '../swagger.json'
import Redis from 'ioredis';
import JSONCache from 'redis-json';
import { logger } from '../winston'

//Load config values
dotenv.config();
if (!process.env.PRIVATE_KEY || !process.env.PUBLIC_KEY || !process.env.PORT || !process.env.REDIS_HOST) {
    logger.debug("Failed to load config");
    process.exit(1);
}
logger.debug("Loaded config successfully!");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const REDIS_HOST = process.env.REDIS_HOST;
const PORT: number = parseInt(process.env.PORT as string, 10);

//Init redis
const redis = new Redis(6379, REDIS_HOST);
const jsonCache = new JSONCache(redis);


const app: Application = express();

//Swagger url
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
routes(app);


export { PRIVATE_KEY, PUBLIC_KEY, PORT, jsonCache, app, redis }