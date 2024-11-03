import { RequestHandler } from 'express';

export function Controller(baseRoute: string = '', ...middleware: RequestHandler[]) {
    return (target: any, _key?: string, _descriptor?: PropertyDescriptor) => {
        Reflect.defineMetadata('baseRoute', baseRoute, target);
        Reflect.defineMetadata('controllerMiddleware', middleware, target);
    };
}
