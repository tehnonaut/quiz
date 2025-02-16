import 'express';
import { IUserToken } from '../models/userModel';

declare global {
	namespace Express {
		export interface Request {
			/**
			 * Optional property to store current user information.
			 * @type {IUserToken}
			 */
			user?: IUserToken;
		}
	}
}
