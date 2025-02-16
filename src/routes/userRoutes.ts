import express from 'express';
import { getUser, changePassword, createUser, authUser, refreshUserToken } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRouter = express.Router();

/**
 * Get User (teachers)
 * GET /user
 */
userRouter.get('/', authMiddleware, getUser);

/**
 * Create User (REGISTER) (teachers)
 * POST /user
 * @param {string} name - The name of the user
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 */
userRouter.post('/', createUser);

/**
 * Authenticate User (LOGIN) (students)
 * POST /user/auth
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 */
userRouter.post('/auth', authUser);

/**
 * Refresh User Token (students) Bearer token required
 * GET /user/refresh-token
 */
userRouter.get('/refresh-token', authMiddleware, refreshUserToken);

/**
 * Change Password (teachers) Bearer token required
 * PUT /user
 * @param {string} password - The password of the user
 */
userRouter.put('/', authMiddleware, changePassword);

export default userRouter;
