import { Express, RequestHandler } from 'express';

export interface IRouteProps {
    route: string;
    middleware: RequestHandler[];
}

export type TRoute = { [key: string]: IRouteProps[] };

export type RouteHandler = Map<keyof Express, Map<string, RequestHandler[]>>;
