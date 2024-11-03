import { Request, Response, NextFunction } from 'express';
import { findQuizByLobby } from '../queries/quizQueries';

/**
 * Middleware to find quiz by lobby code
 */
export const createFindQuizByLobbyCodeMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        req.quiz = await findQuizByLobby(req.session.lobby);
        next();
    };
};

/**
 * Middleware to check if quiz exists
 */
export const createQuizExistsMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.quiz === null) {
            const error = new Error('Quiz niet gevonden');
            res.status(404);
            return next(error);
        }
        next();
    };
};
