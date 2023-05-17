import express from 'express';
import dotenv from 'dotenv';

import config from './config';
import { createBunyanLogger } from './loaders/logger';

const log = createBunyanLogger('App');

async function startServer() {
  const app = express();

  await require('./loaders').default({ expressApp: app });

  app.listen(config.port, () => {
    log.info(`
    ################################################
    🛡️  Server listening on port: ${config.port} 🛡️ 
    ################################################
    `);
  });
}

startServer();