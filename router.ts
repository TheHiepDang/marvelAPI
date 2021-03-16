import express, { Request, response, Response, NextFunction } from "express";
import cryptoJS from 'crypto-js';
import axios from 'axios';
import { PRIVATE_KEY, PUBLIC_KEY } from './MarvelAPI'
import NodeCache from "node-cache";
import { Character } from './interface/character.interface'
import { CharacterDataWrapper } from './interface/characterDataWrapper.interface'
export const itemsRouter = express.Router();


const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });
// Etag interceptor
axios.interceptors.request.use(function (config) {
    if (myCache.get('etag:' + config.url)) {
        console.log('Etag found: ');
        config.headers['If-None-Match'] = myCache.get('etag:' + config.url)
    } else
        console.log('etag not found' + config.url);
    return config;
}, function (error) {
    return Promise.reject(error);
});

const cache = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    // const key: string = req.url;
    // const cachedContent = myCache.get(key);
    // if (cachedContent) {
    //     console.log("Reading from cache");
    //     res.status(200).send(cachedContent);
    //     return;
    // }
    next();
}

//TODO: Add Etag and if-non-match here for better performance
// Done loading config
itemsRouter.get("/characters", cache, async (req: Request, res: Response) => {
    //TODO: Why init timestamp outside of this api causes error? (Hash mismatch)
    const timestamp = Date.now();
    console.log("Continued!");
    // Encrypt
    var hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
    const url = 'https://gateway.marvel.com/v1/public/characters?apikey=' + PUBLIC_KEY + '&ts=' + timestamp + '&hash=' + hash;
    console.log(url);

    axios.get<CharacterDataWrapper>(url)
        .then((response) => {
            const etag = response.data.etag;
            console.log("Fetching real data");
            const characters: [Character] = response.data.data.results;
            const result = characters.map(c => c.id);

            myCache.set(req.url, result, 3600 * 24);
            console.log('setting etag:' + url);
            myCache.set('etag:' + req.url, result, 0);
            res.status(200).send(result);
        })
        .catch((error) => {
            res.status(500).send(error.message);
        });
});


itemsRouter.get("/characters/:id", cache, async (req: Request, res: Response) => {
    //TODO: Check cache
    const id: number = parseInt(req.params.id, 10);
    //TODO: Why init timestamp outside of this api causes error? (Hash mismatch)
    const timestamp = Date.now();

    // Encrypt
    var hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
    const url = 'https://gateway.marvel.com/v1/public/characters/' + id + '?apikey=' + PUBLIC_KEY + '&ts=' + timestamp + '&hash=' + hash;
    console.log(url);
    axios.get<CharacterDataWrapper>(url)
        .then((response) => {
            console.log("Fetching real data");
            const character: Character = (response.data.data.results.map(a => (
                {
                    id: a.id,
                    name: a.name,
                    description: a.description
                }
            ))[0]);
            myCache.set(req.url, character, 3600 * 24);
            myCache.set('etag:' + req.url, character, 0);
            res.status(200).send((character));
        })
        .catch((error) => {
            res.status(500).send(error.message);
        });
});