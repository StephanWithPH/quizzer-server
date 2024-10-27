import http from 'http';
import express from 'express';
import 'express-session';
import mongoose from 'mongoose';
import './config/logging';
import 'reflect-metadata';

import { corsHandler } from './middleware/corsHandler';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { declareHandler } from './middleware/declareHandler';
import { mongo, server, SESSION_SECRET } from './config/config';

import { defineRoutes } from './modules/routes';

import QuizMasterController from './controllers/quizMaster';
import PublicController from './controllers/public';
import { STATIC_FOLDER } from './config/constants';
import session from 'express-session';
import { Server } from 'socket.io';
import { setSocketIOServer } from './socket.io';
import TeamController from './controllers/team';
import { ScoreboardController } from './controllers/scoreboard';

export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

export const Main = async () => {
    logging.log('Initializing API');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json({ limit: '500mb' }));

    const sessionMiddleware = session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    });

    application.use(sessionMiddleware);

    application.set('trust proxy', 1);
    application.use('/static', express.static(STATIC_FOLDER));

    logging.debug('Connect to Mongo');
    try {
        const connection = await mongoose.connect(mongo.MONGO_CONNECTION, mongo.MONGO_OPTIONS);
        logging.log('Connected to Mongo: ', connection.version);
    } catch (error: any) {
        logging.error(error);
        logging.error('Unable to connect to Mongo');
    }

    logging.debug('Define Websocket Server');
    httpServer = http.createServer(application);
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    io.engine.use(sessionMiddleware);
    setSocketIOServer(io);

    logging.debug('Logging & Configuration');
    application.use(declareHandler);
    application.use(loggingHandler);
    application.use(corsHandler);

    logging.debug('Define Controller Routing');
    defineRoutes([PublicController, QuizMasterController, TeamController, ScoreboardController], application);

    logging.debug('Define Routing Error');
    application.use(routeNotFound);

    logging.debug('Starting Server');
    httpServer.listen(server.SERVER_PORT, () => {
        logging.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
    });
};

export const Shutdown = (callback: never) => httpServer && httpServer.close(callback);

Main();
