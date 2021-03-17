import express, { Request, Response, NextFunction } from "express";
import cryptoJS from 'crypto-js';
import axios from 'axios';


import { Character } from './interface/character.interface'
import { CharacterDataWrapper } from './interface/characterDataWrapper.interface'
import { PRIVATE_KEY, PUBLIC_KEY, myCache } from './app'
import { MARVEL_API_BASE_URL, MARVEL_CHARACTER_API, SUCCESS_API_STATUS, TEN_MINUTES, THREE_MINUTES } from './constants'
import { getAPIName } from './util'

export const router = express.Router();

//Axios config
axios.defaults.validateStatus = (status) => {
    return SUCCESS_API_STATUS.includes(status);
}
// Axios etag interceptor
axios.interceptors.request.use(function (config) {
    const etagKey = 'etag:' + getAPIName(config.url);
    console.log('Etag key: ' + etagKey);
    if (config.url && myCache.get(etagKey)) {
        console.log('Etag found: ' + myCache.get(etagKey));
        config.headers['If-None-Match'] = myCache.get(etagKey)
    } else
        console.log('etag not found for %s', etagKey);
    console.log(myCache.keys());
    return config;
}, function (error) {
    return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
    const cachedKey = getAPIName(response.config.url);
    if (response.status == 304 && myCache.has(cachedKey)) {
        console.log("Unmodified data. Retrieving from from cache instead...");
        response.data = myCache.get(cachedKey);
        response.status = 200;
    }
    else if (response.status == 200) {
        console.log('Caching request data');
        myCache.set(cachedKey, response.data, TEN_MINUTES);

        const etag = response.data.etag;
        console.log('Caching etag for: %s', cachedKey, THREE_MINUTES);
        myCache.set('etag:' + cachedKey, etag, 0);
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});

// Router cache handler
const cacheHandler = (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const key: string = req.url;
    const cachedContent = myCache.get(key);
    if (cachedContent) {
        console.log("Reading from cache");
        res.set(cachedContent);
    }
    next();
}

// ROUTERS=====================================================================================================================================
router.get("/characters", cacheHandler, async (req: Request, res: Response) => {
    //TODO: Why init timestamp outside of this api causes error? (Hash mismatch)
    const timestamp = Date.now();
    // Encrypt
    var hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
    const marvelURL = MARVEL_API_BASE_URL + MARVEL_CHARACTER_API + '?apikey=' + PUBLIC_KEY + '&ts=' + timestamp + '&hash=' + hash;
    console.log(marvelURL);

    console.log("Fetching live data...");
    axios.get<CharacterDataWrapper>(marvelURL)
        .then((response) => {
            const characters: [Character] = response.data.data.results;
            const result = characters.map(c => c.id);
            res.status(response.status).send(result);
        })
        .catch((error) => {
            res.status(500).send(error.message);
        });
});


router.get("/characters/:id", cacheHandler, async (req: Request, res: Response) => {
    //TODO: Check cache
    const id: number = parseInt(req.params.id, 10);
    //TODO: Why init timestamp outside of this api causes error? (Hash mismatch)
    const timestamp = Date.now();

    // Encrypt
    var hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
    const marvelURL = MARVEL_API_BASE_URL + MARVEL_CHARACTER_API + '/' + id + '?apikey=' + PUBLIC_KEY + '&ts=' + timestamp + '&hash=' + hash;

    axios.get<CharacterDataWrapper>(marvelURL)
        .then((response) => {
            const character: Character = (response.data.data.results.map(a => (
                {
                    id: a.id,
                    name: a.name,
                    description: a.description
                }
            ))[0]);
            res.status(response.status).send(character);
        })
        .catch((error) => {
            res.status(500).send(error.message);
        });
});