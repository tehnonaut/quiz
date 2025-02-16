import { Request, Response, NextFunction } from 'express';

export const errorHandlerMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error('Error:', err);
	res.status(500).json({ message: 'Internal server error', error: err.message });
};
