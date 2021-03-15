import * as dotenv from "dotenv";

import express from "express";

import { itemsRouter } from './router'

dotenv.config();


if (!process.env.PRIVATE_KEY || !process.env.PUBLIC_KEY || !process.env.PORT) {
    console.log("Failed to load config");
    process.exit(1);
}
console.log("Loaded config successfully!");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use('/api', itemsRouter);

console.log(PRIVATE_KEY);
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});



export { PRIVATE_KEY, PUBLIC_KEY, PORT }