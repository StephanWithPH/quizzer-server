import { Express, RequestHandler } from 'express';
import { SERVER_URL_PREFIX } from '../config/config';

export function defineRoutes(controllers: any, application: Express) {
    for (let i = 0; i < controllers.length; i++) {
        const controller = new controllers[i]();
        const routeHandlers: Map<keyof Express, Map<string, RequestHandler[]>> = Reflect.getMetadata('routeHandlers', controller);
        const controllerPath: string = Reflect.getMetadata('baseRoute', controller.constructor);
        const endpointPrefix: string = SERVER_URL_PREFIX + controllerPath;
        const controllerMiddleware: RequestHandler[] = Reflect.getMetadata('controllerMiddleware', controller.constructor) || [];
        const methods = Array.from(routeHandlers.keys());

        for (let j = 0; j < methods.length; j++) {
            const method = methods[j];
            const routes = routeHandlers.get(method as keyof Express);

            if (routes) {
                const routeNames = Array.from(routes.keys());
                for (let k = 0; k < routeNames.length; k++) {
                    const handlers = routes.get(routeNames[k]) || [];

                    if (handlers) {
                        const middlewares = Reflect.getMetadata('middlewares', controller, routeNames[k]) || [];
                        application[method as keyof Express](endpointPrefix + routeNames[k], ...controllerMiddleware, ...middlewares, ...handlers);
                        logging.debug('Loading route:', method, endpointPrefix + routeNames[k]);
                    }
                }
            }
        }
    }
}
