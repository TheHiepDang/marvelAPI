import {CharacterDataContainer} from './characterDataContainer.interface'

export interface CharacterDataWrapper {
    etag: string;
    data: CharacterDataContainer;
    cachedContent: string;
}