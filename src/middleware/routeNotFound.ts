import { Request, Response, NextFunction } from 'express';

export function routeNotFound(req: Request, res: Response, _: NextFunction) {
    const error = new Error('Not found');
    logging.warning(error.message, 'routeNotFound');

    res.status(404).json({
        error: {
            message: error.message
        }
    });
}
