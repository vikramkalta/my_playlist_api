import expressLoader from './express';
import mongooseLoader from './mongoose';
import { createBunyanLogger } from './logger';

const log = createBunyanLogger('Loaders');

export default async ({ expressApp }): Promise<void> => {
  // Context shall be initialized first
  await mongooseLoader();
  log.info('DB loaded and connected!');

  expressLoader({ app: expressApp });
  log.info('Express loaded');
};