import { Router } from 'express';

import email from './routes/email';
import user from './routes/user';
import userRoles from './routes/user-roles';

// guaranteed to get dependencies
export default () => {
  const app = Router();
  user(app);
  email(app);
  userRoles(app);
  return app;
}