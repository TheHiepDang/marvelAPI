import express, { Request, Response, NextFunction } from "express";
import cryptoJS from 'crypto-js';
import axios from 'axios';
import { logger } from '../../winston'

import { Character } from '../../interface/character.interface'
import { CharacterDataWrapper } from '../../interface/characterDataWrapper.interface'
import { PRIVATE_KEY, PUBLIC_KEY } from '../app'
import { MARVEL_API_BASE_URL, MARVEL_CHARACTER_API, SUCCESS_API_STATUS, CACHE_EXPIRY_TIME } from '../constants'
import { getAPIName } from '../util'
import { retrieveCache, setCache } from '../redis.client'

export const router = express.Router();

//Axios config
axios.defaults.validateStatus = (status) => {
    return SUCCESS_API_STATUS.includes(status);
}
// Axios etag interceptor
axios.interceptors.request.use(async (config) => {
    const cachedKey = getAPIName(config.url);
    const cachedData = await retrieveCache(cachedKey);
    if (cachedData) {
        const etag = (cachedData as CharacterDataWrapper).etag;
        logger.debug('Etag found: ' + etag);
        config.headers['If-None-Match'] = etag
    } else {
        logger.debug('etag not found for %s', cachedData);
    }

    return config;
}, function (error) {
    return Promise.reject(error);
});

axios.interceptors.response.use(async (response) => {
    const cachedKey = getAPIName(response.config.url);
    const cachedData = await retrieveCache(cachedKey);
    if (response.status == 304 && cachedData) {
        logger.debug("Unmodified data. Retrieving from from cache instead...");
        response.data = cachedData;
        response.status = 200;
    }
    else if (response.status == 200) {
        logger.debug('Caching request data %s', cachedKey);
        setCache(cachedKey, response.data, CACHE_EXPIRY_TIME);
    }
    return response;
}, function (error) {
    return Promise.reject(error);
});

// Router cache handler
export const cacheHandler = async (
    req: Request,
    res: Response,
    next: NextFunction) => {
    const key: string = req.url;
    const cachedContent = await retrieveCache(key);
    if (cachedContent) {
        logger.debug("Reading from cache %s", cachedContent);
        res.set(cachedContent);
    } else {
        logger.debug("Empty cache result %s", cachedContent);
    }
    next();
}

// ROUTERS=====================================================================================================================================
router.get("/characters", cacheHandler, async (req: Request, res: Response) => {
    const timestamp = Date.now();
    // Encrypt
    const hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
    const marvelURL = MARVEL_API_BASE_URL + MARVEL_CHARACTER_API + '?apikey=' + PUBLIC_KEY + '&ts=' + timestamp + '&hash=' + hash;

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
    const id: number = parseInt(req.params.id, 10);
    const timestamp = Date.now();

    // Encrypt
    const hash = cryptoJS.MD5(timestamp + PRIVATE_KEY + PUBLIC_KEY).toString();
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