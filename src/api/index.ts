import { IRouter, Router } from 'express';
import track from './routes/track';

// guaranteed to get dependencies
export default (): IRouter => {
  const app = Router();
  track(app);
  return app;
}