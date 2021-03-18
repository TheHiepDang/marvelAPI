import request from 'supertest';
import { app, redis } from '../app';
import charactersData from './getCharactersData.json';
import characterData from './getCharacterData.json';
import axios from 'axios';
import { cacheHandler } from '../controller/router'
import { Request, Response } from "express";
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockRequest = {} as Request;
const mockResponse = {} as Response;
const nextFunc = jest.fn();

describe('characters api', () => {
    it('should be invoked successfully', async () => {
        mockedAxios.get.mockResolvedValue({ data: charactersData, status: 200 });
        const result = await request(app)
            .get('/api/characters').send();
        await cacheHandler(mockRequest, mockResponse, nextFunc);
        expect(nextFunc).toBeCalledTimes(1);
        expect(result.status).toBe(200);
        expect(result.body).toStrictEqual([
            1011334,
            1017100,
            1009144,
            1010699,
            1009146,
            1016823,
            1009148,
            1009149,
            1010903,
            1011266,
            1010354,
            1010846,
            1011297,
            1011031,
            1009150,
            1011198,
            1011175,
            1011136,
            1011176,
            1010870,
        ]);
        expect(result.body).toHaveLength(20);
    });
    it('should fail upon receiving empty data from Marvel API', async () => {
        mockedAxios.get.mockResolvedValue({ data: {}, status: 200 });
        const result = await request(app)
            .get('/api/characters').send();
        await cacheHandler(mockRequest, mockResponse, nextFunc);
        expect(nextFunc).toBeCalledTimes(1);
        expect(result.status).toBe(500);
    });
    it('should fail upon receiving unknown http status (Diff from 200 or 304)', async () => {
        mockedAxios.get.mockResolvedValue({ data: charactersData, status: 500 });
        const result = await request(app)
            .get('/api/characters').send();
        await cacheHandler(mockRequest, mockResponse, nextFunc);
        expect(nextFunc).toBeCalledTimes(1);
        expect(result.status).toBe(500);
    });
});

describe('/character api invocation', () => {
    it('should be invoked successfully', async () => {
        mockedAxios.get.mockResolvedValue({ data: characterData, status: 200 });
        const result = await request(app)
            .get('/api/characters/12345').send();
        await cacheHandler(mockRequest, mockResponse, nextFunc);
        expect(nextFunc).toBeCalledTimes(1);
        expect(result.status).toBe(200);
        expect(result.body).toStrictEqual({ "description": "", "id": 1011334, "name": "3-D Man" });
    });
    it('should fail upon receiving empty data from Marvel API', async () => {
        mockedAxios.get.mockResolvedValue({ data: {}, status: 200 });
        const result = await request(app)
            .get('/api/characters/12345').send();
        await cacheHandler(mockRequest, mockResponse, nextFunc);
        expect(nextFunc).toBeCalledTimes(1);
        expect(result.status).toBe(500);
    });
    it('should fail upon receiving unknown http status (Diff from 200 or 304)', async () => {
        mockedAxios.get.mockResolvedValue({ data: characterData, status: 500 });
        const result = await request(app)
            .get('/api/characters/12345').send();
        await cacheHandler(mockRequest, mockResponse, nextFunc);
        expect(nextFunc).toBeCalledTimes(1);
        expect(result.status).toBe(500);
    });
});


afterAll(() => redis.quit());