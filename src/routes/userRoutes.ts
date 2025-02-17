import express from 'express';
import { getUser, changePassword, createUser, authUser, refreshUserToken } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const userRouter = express.Router();

/**
 * @api {get} /user Get User
 * @apiName GetUser
 * @apiGroup User
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 */
userRouter.get('/', authMiddleware, getUser);

/**
 * @api {post} /user Create User
 * @apiName CreateUser
 * @apiGroup User
 * @apiPermission Public
 *
 * @apiBody {String} name The name of the user
 * @apiBody {String} email The email of the user
 * @apiBody {String} password The password of the user
 */
userRouter.post('/', createUser);

/**
 * @api {post} /user/auth Authenticate User
 * @apiName AuthenticateUser
 * @apiGroup User
 * @apiPermission Public
 *
 * @apiBody {String} email The email of the user
 * @apiBody {String} password The password of the user
 */
userRouter.post('/auth', authUser);

/**
 * @api {get} /user/refresh-token Refresh User Token
 * @apiName RefreshUserToken
 * @apiGroup User
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 */
userRouter.get('/refresh-token', authMiddleware, refreshUserToken);

/**
 * @api {put} /user Change Password
 * @apiName ChangePassword
 * @apiGroup User
 * @apiPermission User
 *
 * @apiHeader {String} Authorization Bearer token
 *
 * @apiBody {String} password The password of the user
 */
userRouter.put('/', authMiddleware, changePassword);

export default userRouter;
