import { Application, Handler, Router } from 'express';
import { router, cacheHandler } from './controller/router';

const _routes: [string, Handler, Router][] = [
    ['/api', cacheHandler, router],
];

export const routes = (app: Application) => {
    _routes.forEach((route) => {
        const [url, handler, controller] = route;
        app.use(url, handler, controller);
    });
};