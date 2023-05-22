import express from 'express';
import dotenv from 'dotenv';
import loaders from './loaders';

import config from './config';
import { createBunyanLogger } from './loaders/logger';

dotenv.config();
const log = createBunyanLogger('App');

async function startServer(): Promise<void> {
  const app = express();

  await loaders({ expressApp: app });

  app.listen(config.port, () => {
    log.info(`
    ################################################
    🛡️  Server listening on port: ${config.port} 🛡️ 
    ################################################
    `);
  });
}

startServer();