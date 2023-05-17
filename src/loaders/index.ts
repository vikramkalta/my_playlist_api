import expressLoader from './express';
import mongooseLoader from './mongoose';
import { createBunyanLogger } from './logger';

const log = createBunyanLogger('Loaders');

export default async ({ expressApp }) => {
  // Context shall be initialized first
  await mongooseLoader();
  log.info('DB loaded and connected!');

  await expressLoader({ app: expressApp });
  log.info('Express loaded');
};