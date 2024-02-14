import { Router, Request, Response, NextFunction } from 'express';
import { celebrate, Joi } from 'celebrate';

import { createBunyanLogger } from '../../loaders/logger';
import middlewares from '../middlewares/index';
import TrackService from '../../services/track';

const route = Router();
const log = createBunyanLogger('User routes');

export default (app: Router): void => {
  app.use('/track', route);

  /**
    * @api {post} /track Create track.
    * @apiName Create track
    * @apiGroup Track
    * 
    * @apiBody {String} trackUrl        Track url.
    * 
    * @apiSuccess {Boolean} success Determines the status of an API.
    * @apiSuccess {Object} data Data object holding main response data.
    * @apiSuccess {Number} data._id User's ID.
    *
    * @apiSuccessExample {json} Success Response:
    *     HTTP/1.1 200 OK
    *     {
    *         "success": true,
    *         "data": {
    *             "_id": "123"
    *         }
    *     }
   */
  route.post('/', middlewares.logger, celebrate({
    body: Joi.object({
      trackUrl: Joi.string().required(),
    }).options({ allowUnknown: true }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trackService = new TrackService();
      const result = await trackService.createTrack(req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in create track route', error);
      return next(error);
    }
  });

  /**
    * @api {put} /track Update track.
    * @apiName Update track
    * @apiGroup Track
    * 
    * @apiBody {String} trackUrl        Optional Track url
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
  route.put('/', middlewares.logger, celebrate({
    body: Joi.object({ _id: Joi.string().required() }).options({ allowUnknown: true }),
  }), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trackService = new TrackService();
      const result = await trackService.updateTrack({ _id: req.body._id }, req.body);
      return res.send(result);
    } catch (error) {
      log.error('Error in update track route', error);
      return next(error);
    }
  });

  /**
    * @api {get} /track Get track list.
    * @apiName Get track list.
    * @apiGroup Track
    * 
    * @apiSuccess {Boolean} success Determines the status of an API.
    * @apiSuccess {Object} data Data object holding main response data.
    * @apiSuccess {Boolean} data.success Determines operation's result.
    *
    * @apiSuccessExample {json} Success Response:
    *     HTTP/1.1 200 OK
    *     {
    *         "success": true,
    *         "data": [{
    *             "_id": "123",
    *             "trackUrl": "https://.soundcloud.com/dave_the_drummer"
    *         }]
    *     }
   */
  route.get('/', middlewares.logger, async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const trackService = new TrackService();
      const result = await trackService.getTracks();
      return res.send(result);
    } catch (error) {
      log.error('Error in get tracks route', error);
      return next(error);
    }
  });

  /**
    * @api {delete} /track Delete track.
    * @apiName Delete track.
    * @apiGroup Track
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
  route.delete('/', middlewares.logger, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const trackService = new TrackService();
      const result = await trackService.deleteTrack({ _id: req.body.id });
      return res.send(result);
    } catch (error) {
      log.error('Error in delete track route', error);
      return next(error);
    }
  });
};