import { connect } from 'mongoose';

import { createBunyanLogger } from './logger';

const log = createBunyanLogger('MongooseLoader');

let clientConnection;

export default async (): Promise<any> => {
  try {
    // Connect to MongoDB
    const db: any = await connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const client = db.connections[0].client;

    clientConnection = client.db(process.env.MONGO_DB_NAME);
    log.info('connection established');
  } catch (error) {
    log.error(error);
    process.exit(1);
  }
};

const getDbInstance = () => clientConnection;
export { getDbInstance };