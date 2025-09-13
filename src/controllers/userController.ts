import { Request, Response, NextFunction } from 'express';
import User, { IUserToken } from '../models/userModel';
import { generateTokenFromUser } from '../utils/tokenUtil';
import { addTokenToBlacklist } from '../utils/tokenBlacklist';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const user = await User.findById(u.id);

		if (!user) {
			res.status(404).json({ message: 'User not found' });
			return;
		}

		res.json({ message: 'User fetched', user });
	} catch (error) {
		next(error);
	}
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { name, email, password } = req.body;

		const existingUser = await User.findOne({ email: { $eq: email } });
		if (existingUser) {
			res.status(400).json({ message: 'User already exists' });
			return;
		}

		const user = await User.create({ name, email, password });

		const token = generateTokenFromUser(user);
		res.json({ message: 'User created', token });
	} catch (error) {
		next(error);
	}
};

export const authUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body;
		//find one and select password
		const user = await User.findOne({ email: { $eq: email } }).select('+password');

		if (!user) {
			res.status(401).json({ message: 'Invalid email or password' });
			return;
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			res.status(401).json({ message: 'Invalid email or password' });
			return;
		}
		const token = generateTokenFromUser(user);
		res.json({ message: 'Login successful', token });
	} catch (error) {
		next(error);
	}
};

// Refresh token
export const refreshUserToken = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const u = req.user as IUserToken;

		const user = await User.findById(u.id);

		if (!user) {
			res.status(401).json({ message: 'Invalid token' });
			return;
		}

		const newToken = generateTokenFromUser(user);
		res.json({ message: 'Token refreshed', token: newToken });
	} catch (error) {
		next(error);
	}
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { password } = req.body;
		const u = req.user as IUserToken;

		const user = await User.findById(u.id);
		if (!user) {
			res.status(404).json({ message: 'User not found' });
			return;
		}

		user.password = password;

		await user.save();
		res.json({ message: 'Password updated' });
	} catch (error) {
		next(error);
	}
};

export const logoutUser = async (req: Request, res: Response, _next: NextFunction) => {
	const u = req.user as IUserToken;
	addTokenToBlacklist(u);
	res.json({ message: 'Logout successful' });
};
