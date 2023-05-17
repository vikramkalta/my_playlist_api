import { celebrate, Joi } from 'celebrate';
import { NextFunction, Request, Response, Router } from 'express';

import { createBunyanLogger } from '../../loaders/logger';
import EmailService from '../../services/email';
import { GLOBAL_APP_CONFIG_KEY } from '../../utility';
import middlewares from '../middlewares';

const route = Router();
const log = createBunyanLogger('EmailRoutes');

export default (app: Router) => {
  app.use('/email', route);

  route.get('/verify',
    middlewares.logger,
    celebrate({
      query: Joi.object({
        token: Joi.string().required()
      }).options({ allowUnknown: true })
    }),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const emailService = new EmailService();
        const result = await emailService.verifyEmail(req.query);
        log.info('result of verify email', result);
        const appConfig = global[GLOBAL_APP_CONFIG_KEY];
        return res.redirect(appConfig.VERIFY_EMAIL_REDIRECT_SUCCESS);
      } catch (error) {
        log.error('Error in verify email route:', error);
        const appConfig = global[GLOBAL_APP_CONFIG_KEY];
        return res.redirect(appConfig.VERIFY_EMAIL_REDIRECT_FAILURE);
      }
    });

  route.post('/', middlewares.logger, celebrate({
    body: Joi.object({
      Email: Joi.string().required()
    })
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailService = new EmailService();
      const result = await emailService.createEmail(req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in create email api', error);
      return next(error);
    }
  });
}
