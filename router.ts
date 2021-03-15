import express, { Request, Response } from "express";
import cryptoJS from 'crypto-js';
import request from 'request';
import { PRIVATE_KEY, PUBLIC_KEY } from './MarvelAPI'
export const itemsRouter = express.Router();



//TODO: Add Etag and if-non-match here for better performance
// Done loading config
itemsRouter.get("/characters", async (req: Request, res: Response) => {

    //TODO: Why init timestamp outside of this api causes error? (Hash mismatch)
    const timestamp = Date.now();

    // Encrypt
    var hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
    console.log(timestamp + PRIVATE_KEY + PUBLIC_KEY);

    console.log("timestampe: " + timestamp);
    console.log(PRIVATE_KEY);
    console.log(PUBLIC_KEY);
    console.log(hash);
    const url = 'https://gateway.marvel.com/v1/public/characters?apikey=' + PUBLIC_KEY + '&ts=' + timestamp + '&hash=' + hash;
    console.log(url);
    try {
        request(url, { json: true }, (err, res, body) => {
            if (err) {
                console.log("Error!");
                // return console.log(err);
            }
            // console.log("fine")
            console.log(res);
        });
        console.log("Character API");
        res.status(200).send("");
    } catch (e) {
        res.status(500).send(e.message);
    }
});


itemsRouter.get("/characters/:id", async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10);
    //TODO: Why init timestamp outside of this api causes error? (Hash mismatch)
    const timestamp = Date.now();

    // Encrypt
    var hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
    console.log(timestamp + PRIVATE_KEY + PUBLIC_KEY);

    console.log("timestampe: " + timestamp);
    console.log(PRIVATE_KEY);
    console.log(PUBLIC_KEY);
    console.log(hash);
    const url = 'https://gateway.marvel.com/v1/public/characters/'+id+'?apikey=' + PUBLIC_KEY + '&ts=' + timestamp + '&hash=' + hash;
    console.log(url);
    try {
        request(url, { json: true }, (err, res, body) => {
            if (err) {
                console.log("Error!");
                // return console.log(err);
            }
            // console.log("fine")
            console.log(res);
        });
        console.log("Character API");
        res.status(200).send("");
    } catch (e) {
        res.status(500).send(e.message);
    }
});