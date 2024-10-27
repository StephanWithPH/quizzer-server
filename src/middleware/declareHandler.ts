import { Request, Response, NextFunction } from 'express';
import { Role } from '../enums/role';
import { QuizInterface } from '../models/quiz';
import { TeamInterface } from '../models/team';

declare global {
    namespace Express {
        interface Request {
            quiz?: QuizInterface | null;
            team?: TeamInterface | null;
            answer?: string;
        }
    }
}

/*
    Express session data augmentation
 */
declare module 'express-session' {
    interface SessionData {
        role: Role;
        lobby: string;
        _id?: string;
    }
}

export function declareHandler(req: Request, res: Response, next: NextFunction) {
    next();
}
