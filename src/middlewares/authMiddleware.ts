import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IUserToken } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_FOR_JWT_IS_SECRET';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const decoded = jwt.verify(token, JWT_SECRET) as IUserToken;

	const userId = decoded.id;

	if (!userId) {
		res.status(401).json({ message: 'Unauthorized' });
		return;
	}

	const user: IUserToken = {
		id: userId,
		iat: decoded.iat,
		exp: decoded.exp,
		name: decoded.name,
		email: decoded.email,
	};

	req.user = user as IUserToken;
	return next();
};
