import * as dotenv from "dotenv";

import express, { Application } from 'express';

import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import { routes } from './routes';

import Redis from 'ioredis';
import JSONCache from 'redis-json';

//Load config values
dotenv.config();
if (!process.env.PRIVATE_KEY || !process.env.PUBLIC_KEY || !process.env.PORT) {
    console.debug("Failed to load config");
    process.exit(1);
}
console.debug("Loaded config successfully!");

//Swagger
const spec = fs.readFileSync('swagger.yml', 'utf8');
const jsyaml = require('js-yaml');
const swaggerDoc = jsyaml.load(spec);

//Init redis
const redis = new Redis();
const jsonCache = new JSONCache(redis);

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT: number = parseInt(process.env.PORT as string, 10);
const app: Application = express();
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
routes(app);


export { PRIVATE_KEY, PUBLIC_KEY, PORT, jsonCache, app, redis }