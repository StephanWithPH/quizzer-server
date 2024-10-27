import { Request, Response, NextFunction } from 'express';
import { findTeamById } from '../queries/teamQueries';

/**
 * Middleware to check if the team name is unique
 */
export const createTeamNameUniqueMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body.name || req.body.name.trim().length === 0) {
            const error = new Error('Geen naam meegegeven');
            res.status(400);
            return next(error);
        }
        next();
    };
};

/**
 * Middleware to check if the length of the team name is not too long
 */
export const createTeamNameMaxLengthMiddleware = (length = 30) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.name && req.body.name.length > length) {
            const error = new Error('Team naam is te lang');
            res.status(400);
            return next(error);
        }
        next();
    };
};

/**
 * Middleware to find team by id
 */
export const createFindTeamByIdMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        req.team = await findTeamById(req.session._id!);
        next();
    };
};

/**
 * Middleware to check if team accepted exists
 */
export const createTeamAcceptedMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.team?.accepted === false) {
            const error = new Error('Team niet geaccepteerd');
            res.status(403);
            return next(error);
        }
        next();
    };
};

/**
 * No answer provided
 */
export const createAnswerProvidedMiddleware = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.body.answer || req.body.answer.trim().length === 0) {
            const error = new Error('Geen antwoord meegegeven');
            res.status(400);
            return next(error);
        }
        next();
    };
};

/**
 * Middleware to check if the length of the given answer name is not too long
 */
export const createAnswerQuestionLengthMiddleware = (length = 35) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.body.answer && req.body.answer.length > length) {
            const error = new Error('Antwoord op de vraag is te lang');
            res.status(400);
            return next(error);
        }
        next();
    };
};
