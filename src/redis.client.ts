import { ISetOptions } from 'redis-json/types/src/interfaces';
import { jsonCache } from './app'
import { logger } from '../winston'

const retrieveCache = (key: string) => {
    return jsonCache.get(key);
}

const setCache = (key: string, data: JSON, duration: number) => {
    logger.debug("Set cache for %s", key);
    const option: ISetOptions = {
        expire : duration
    }
    return jsonCache.set(key, data, option);
}

export { retrieveCache, setCache }