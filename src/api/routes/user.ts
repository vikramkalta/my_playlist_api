import { Router, Request, Response, NextFunction } from 'express';
import { celebrate, Joi } from 'celebrate';

import { createBunyanLogger } from '../../loaders/logger';
import middlewares from '../middlewares';
import UserService from '../../services/user';

const route = Router();
const log = createBunyanLogger('User routes');

export default (app: Router): void => {
  app.use('/user', route);

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

  route.put('/', middlewares.logger, middlewares.auth, celebrate({
    query: Joi.object({ _id: Joi.string().required() }).options({ allowUnknown: true }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      req.body.token = req.headers.authorization.split(' ')[1];
      req.body.UserId = req.query.UserId;
      const result = await userService.updateUser(req.body, req.query);
      return res.send(result);
    } catch (error) {
      log.error('Error in update user route', error);
      return next(error);
    }
  });

  route.get('/', middlewares.logger, celebrate({
    query: Joi.object({ email: Joi.string().required() }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
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
      Email: Joi.string().required(),
      Password: Joi.string().required(),
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