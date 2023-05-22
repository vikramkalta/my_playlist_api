import mongoose, { connect, ConnectOptions, mongo } from 'mongoose';
import { createBunyanLogger } from './logger';

const log = createBunyanLogger('MongooseLoader');

let clientConnection: mongo.MongoClient;

export default async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connect(process.env.MONGO_URL, ({
      useNewUrlParser: true,
      useUnifiedTopology: true
    } as ConnectOptions));
    const client = mongoose.connection[0].client;

    clientConnection = client.db(process.env.MONGO_DB_NAME);
    log.info('connection established');
  } catch (error) {
    log.error(error);
    process.exit(1);
  }
};

const getDbInstance = (): mongo.MongoClient => clientConnection;
export { getDbInstance };