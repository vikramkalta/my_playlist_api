import { Router, Request, Response, NextFunction } from 'express';
import { celebrate, Joi } from 'celebrate';

import UserRoleService from '../../services/user-roles';
import { createBunyanLogger } from '../../loaders/logger';
import middlewares from '../middlewares';

const route = Router();
const log = createBunyanLogger('UserRoleRoutes');

export default (app: Router): void => {
  app.use('/user-role', route);

  route.post('/', middlewares.logger, celebrate({
    body: Joi.object({
      RoleName: Joi.string().required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleService = new UserRoleService();
      const result = await userRoleService.createUserRole(req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error occurred in create user role api', error);
      return next(error);
    }
  });

  route.get('/', middlewares.logger, celebrate({
    query: Joi.object({
      RoleName: Joi.string().required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleService = new UserRoleService();
      const result = await userRoleService.getUserRole(req.query);
      return res.send(result);
    } catch (error) {
      log.error('Error occurred in get user role api', error);
      return next(error);
    }
  });

  route.get('/all', middlewares.logger, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleService = new UserRoleService();
      const result = await userRoleService.getUserRoles();
      return res.send(result);
    } catch (error) {
      log.error('Error occurred in get user role api', error);
      return next(error);
    }
  });

  route.put('/', middlewares.logger, celebrate({
    query: Joi.object({
      RoleName: Joi.string().required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleService = new UserRoleService();
      const result = await userRoleService.updateUserRole(req.query, req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error occurred in update user role api', error);
      return next(error);
    }
  });

  route.put('/permissions', middlewares.logger, celebrate({
    query: Joi.object({
      RoleName: Joi.string().required()
    }),
    body: Joi.object({
      ModuleName: Joi.string().required(),
      ModuleCode: Joi.number().required(),
      Permissions: Joi.object({
        Create: Joi.boolean().required(),
        Read: Joi.boolean().required(),
        Update: Joi.boolean().required(),
        Delete: Joi.boolean().required(),
      }).options({ allowUnknown: true }).required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleService = new UserRoleService();
      const result = await userRoleService.updatePermissions(req.query, req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error occurred in update user permissions api', error);
      return next(error);
    }
  });

  route.delete('/', middlewares.logger, celebrate({
    query: Joi.object({
      RoleName: Joi.string().required(),
    }).options({ allowUnknown: true })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoleService = new UserRoleService();
      const result = await userRoleService.deleteUserRole(req.query);
      return res.send(result);
    } catch (error) {
      log.error('Error occurred in delete user role api', error);
      return next(error);
    }
  });
}