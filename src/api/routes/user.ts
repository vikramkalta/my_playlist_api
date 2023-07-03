import { Router, Request, Response, NextFunction } from 'express';
import { celebrate, Joi } from 'celebrate';

import { createBunyanLogger } from '../../loaders/logger';
import middlewares from '../middlewares';
import UserService from '../../services/user';

const route = Router();
const log = createBunyanLogger('User routes');

export default (app: Router): void => {
  app.use('/user', route);

  /**
    * @api {post} /user Register user.
    * @apiName RegisterUser
    * @apiGroup User
    * 
    * @apiBody {String} firstName        Firstname of the user.
    * @apiBody {String} lastname         Lastname.
    * @apiBody {String} username         Unique username of the user.
    * @apiBody {String} email            Email of the user.
    * @apiBody {Date} dob                Date of birth object.
    * @apiBody {String} password         Password for login.
    * 
    * @apiSuccess {Boolean} success Determines the status of an API.
    * @apiSuccess {Object} data Data object holding main response data.
    * @apiSuccess {Number} data._id User's ID.
    * @apiSuccess {String} data.token Auth token.
    *
    * @apiSuccessExample {json} Success Response:
    *     HTTP/1.1 200 OK
    *     {
    *         "success": true,
    *         "data": {
    *             "_id": "123",
    *             "token": "token123"
    *         }
    *     }
   */
  route.post('/', middlewares.logger, celebrate({
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      username: Joi.string().required(),
      email: Joi.string().required(),
      dob: Joi.date().required(),
      password: Joi.string().required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      const result = await userService.createOrGetUser(req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in create user route', error);
      return next(error);
    }
  });

  /**
    * @api {post} /user/username Check username.
    * @apiName CheckUsername
    * @apiGroup User
    * 
    * @apiBody {String} username Unique username of the user.
    * 
    * @apiSuccess {Boolean} success Determines the status of an API.
    * @apiSuccess {Object} data Data object holding main response data.
    * @apiSuccess {Boolean} data.success Determines whether username exists or not.
    *
    * @apiSuccessExample {json} Success Response:
    *     HTTP/1.1 200 OK
    *     {
    *         "success": true,
    *         "data": {
    *             "exists": false
    *         }
    *     }
   */
  route.post('/username', middlewares.logger, celebrate({
    body: Joi.object({ username: Joi.string().required() })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      const result = await userService.checkUsername(req.body);
      return res.send(result); 
    } catch (error) {
      log.error('Error in check username route', error);
      return next(error);
    }
  });

  /**
    * @api {put} /user Update user.
    * @apiName UpdateUser
    * @apiGroup User
    * 
    * @apiBody {String} firstName        Optional Firstname of the user.
    * @apiBody {String} lastname         Optional Lastname.
    * @apiBody {String} username         Optional Unique username of the user.
    * @apiBody {Date} dob                Optional Date of birth object.
    * 
    * @apiSuccess {Boolean} success Determines the status of an API.
    * @apiSuccess {Object} data Data object holding main response data.
    * @apiSuccess {Boolean} data.success Determines operation's result.
    *
    * @apiSuccessExample {json} Success Response:
    *     HTTP/1.1 200 OK
    *     {
    *         "success": true,
    *         "data": {
    *             "success": true
    *         }
    *     }
   */
  route.put('/', middlewares.logger, middlewares.auth, celebrate({
    body: Joi.object({ _id: Joi.string().required() }).options({ allowUnknown: true }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      req.body.token = req.headers.authorization.split(' ')[1];
      delete req.body.email; // just in case
      delete req.body.password; // same as above
      const result = await userService.updateUser({ _id: req.body._id }, req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in update user route', error);
      return next(error);
    }
  });

  /**
    * @api {get} /user Get user.
    * @apiName GetUser
    * @apiGroup User
    * 
    * @apiBody {String} firstName        Optional Firstname of the user.
    * @apiBody {String} lastname         Optional Lastname.
    * @apiBody {String} username         Optional Unique username of the user.
    * @apiBody {Date} dob                Optional Date of birth object.
    * 
    * @apiSuccess {Boolean} success Determines the status of an API.
    * @apiSuccess {Object} data Data object holding main response data.
    * @apiSuccess {Boolean} data.success Determines operation's result.
    *
    * @apiSuccessExample {json} Success Response:
    *     HTTP/1.1 200 OK
    *     {
    *         "success": true,
    *         "data": {
    *             "firstName": "Test",
    *             "lastname": "Test",
    *             "username": "test123"
    *         }
    *     }
   */
  route.get('/', middlewares.logger, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      const result = await userService.getUser(req.query as { email: string });
      return res.send(result);
    } catch (error) {
      log.error('Error in get user route', error);
      return next(error);
    }
  });

  route.post('/login', middlewares.logger, celebrate({
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      const result = await userService.loginUser(req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in login route', error);
      return next(error);
    }
  });

  route.post('/token', middlewares.logger, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      const result = userService.createAuthToken(req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in create token route', error);
      return next(error);
    }
  });
};