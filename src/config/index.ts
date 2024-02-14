import { createBunyanLogger } from '../loaders/logger';

const log = createBunyanLogger('Config');
// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
log.info('process.env.NODE_ENV', process.env.NODE_ENV);

export default {
  port: 3001,
  logs: {
    level: process.env.LOG_LEVEL || 'silly'
  },
  api: {
    prefix: '/api'
  },
}