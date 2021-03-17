import { MARVEL_API_BASE_URL } from './constants'
const getAPIName = (url: string | undefined) => {
    console.log("Handling etag extraction for %s", url)
    if (url === undefined) return '';
    return url.split('?')[0].replace(MARVEL_API_BASE_URL, '');
}

export { getAPIName }