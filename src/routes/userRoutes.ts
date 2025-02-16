import express from 'express';
import { getUser, changePassword, createUser, authUser, refreshUserToken } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRouter = express.Router();

userRouter.get('/', authMiddleware, getUser);
userRouter.put('/', authMiddleware, changePassword);
userRouter.post('/', createUser);
userRouter.post('/auth', authUser);
userRouter.post('/refresh-token', authMiddleware, refreshUserToken);

export default userRouter;
