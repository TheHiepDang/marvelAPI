import { ISetOptions } from 'redis-json/types/src/interfaces';
import { jsonCache } from './app'
const retrieveCache = (key: string) => {
    return jsonCache.get(key);
}

const setCache = (key: string, data: any, duration: number) => {
    console.debug("Set cache for %s", key);
    const option: ISetOptions = {
        expire : duration
    }
    return jsonCache.set(key, data, option);
}

export { retrieveCache, setCache }