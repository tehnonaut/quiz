import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser, IUserToken } from '../models/userModel';

import type { StringValue } from 'ms';

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_FOR_JWT_IS_SECRET';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

export const generateToken = (payload: IUserToken) => {
	const options: SignOptions = { expiresIn: JWT_EXPIRATION as StringValue };
	return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string) => {
	return jwt.verify(token, JWT_SECRET);
};

export const decodeToken = (token: string) => {
	return jwt.decode(token);
};

export const generateTokenFromUser = (user: IUser) => {
	return generateToken({ id: user._id.toString(), name: user.name, email: user.email });
};
