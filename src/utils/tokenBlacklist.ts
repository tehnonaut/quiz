// Token blacklist management

import { IUserToken } from '../models/userModel';

interface TokenBlacklistMap {
	[key: string]: number;
}

const tokenBlacklist: TokenBlacklistMap = {};

export const addTokenToBlacklist = (token: IUserToken) => {
	if (!token.id || token.iat === undefined || token.exp === undefined) {
		return;
	}
	const key = `${token.id}-${token.iat}`;
	tokenBlacklist[key] = token.exp * 1000; // store expiration in ms
	console.log(`Token added to blacklist: ${key}, expires at ${tokenBlacklist[key]}`);
	//entire list of tokens
	console.log('Current token blacklist:', tokenBlacklist);
};

export const isTokenBlacklisted = (token: IUserToken): boolean => {
	if (!token.id || token.iat === undefined) {
		return false;
	}
	const key = `${token.id}-${token.iat}`;
	const expiry = tokenBlacklist[key];
	if (!expiry) {
		return false;
	}
	if (expiry <= Date.now()) {
		delete tokenBlacklist[key];
		return false;
	}
	return true;
};

export default tokenBlacklist;
