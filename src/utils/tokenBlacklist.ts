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
