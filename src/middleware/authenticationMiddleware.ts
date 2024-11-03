import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { Role } from '../enums/role';
import { JWT_SECRET_KEY } from '../config/config';

/**
 * Middleware to check if user is authenticated with a bearer token
 */
export const createBearerMiddleware = () => async (req: Request, res: Response, next: NextFunction) => {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        const error = new Error('No authorization header found');
        res.status(401);
        return next(error);
    }
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
        const error = new Error('No token found in authorization header');
        res.status(401);
        return next(error);
    }
    const secretKey = new TextEncoder().encode(JWT_SECRET_KEY);

    try {
        const { payload } = await jwtVerify(token, secretKey);

        // Get user that has at least this token in its tokens array
        req.session.role = payload.role as Role;
        req.session.lobby = payload.lobby as string;
        req.session._id = payload._id as string;

        next();
    } catch (e) {
        logging.error(e);
        const error = new Error('Invalid token');
        res.status(401);
        next(error);
    }
};

/**
 * Middleware to check if role is really quizmaster (make sepearate function if used in multiple places)
 */
export const createRoleMiddleware = (role: Role) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.session.role !== role) {
            const error = new Error('Niet geauthorizeerd voor deze route');
            res.status(403);
            return next(error);
        }
        next();
    };
};
