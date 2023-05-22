import { Router, Request, Response, NextFunction } from 'express';
import { celebrate, Joi } from 'celebrate';

import { createBunyanLogger } from '../../loaders/logger';
import middlewares from '../middlewares';
import UserService from '../../services/user';

const route = Router();
const log = createBunyanLogger('User routes');

export default (app: Router): void => {
  app.use('/user', route);

  route.post('/', middlewares.logger, middlewares.auth, celebrate({
    body: Joi.object({
      FirstName: Joi.string().required(),
      Email: Joi.string().required(),
      Role: Joi.string().required(),
      RequestType: Joi.string().valid('StaffUser', 'Customer').required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      req.body.token = req.headers.authorization.split(' ')[1];
      const result = await userService[`create${req.body.RequestType}`](req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in create user route', error);
      return next(error);
    }
  });

  route.put('/', middlewares.logger, middlewares.auth, celebrate({
    query: Joi.object({
      UserId: Joi.string().required(),
    }).options({ allowUnknown: true }),
    body: Joi.object({
      RequestType: Joi.string().valid('StaffUser', 'Customer').required(),
    }).options({ allowUnknown: true }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      req.body.token = req.headers.authorization.split(' ')[1];
      req.body.UserId = req.query.UserId;
      const result = await userService[`update${req.body.RequestType}`](req.body, req.query);
      // const result = await userService.updateStaffUser(req.body, req.query);
      return res.send(result);
    } catch (error) {
      log.error('Error in update user route', error);
      return next(error);
    }
  });

  route.get('/', middlewares.logger, celebrate({
    query: Joi.object({}).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userService = new UserService();
      const result = await userService.getUser(req.query);
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
      log.error('Error in create user route', error);
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