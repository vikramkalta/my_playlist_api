import moment from 'moment';

import { createBunyanLogger } from '../../loaders/logger';
import { TOKEN_EXPIRY, safePromise, STATUS_CODES, STATUSES, decrypt } from '../../utility';

const log = createBunyanLogger('AuthMiddleware');

const authMiddleware = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return errorHandler(next);
    }
    const token = req.headers.authorization.split(' ');
    if (!token[1]) {
      return errorHandler(next);
    }

    const result = await validateToken(token[1], next);
    req.User = result;
    return next();
  } catch (error) {
    return errorHandler(next);
  }
};

const validateToken = async (token, next) => {
  try {
    const [err, result] = await safePromise(decrypt(token));

    if (err || !result.signatureIsValid) {
      return next({ ...err, status: STATUS_CODES[STATUSES.unauthorized] });
    }

    const currentTime = moment().unix(); // Seconds
    const valid = result?.payload?.time + TOKEN_EXPIRY >= currentTime;

    if (!valid) {
      return next({ status: STATUS_CODES[STATUSES.unauthorized], message: 'Token expired!' });
    }

    return result.payload;
  } catch (error) {
    return errorHandler(next);
  }
}

const errorHandler = next => next({ message: STATUSES.unauthorized, status: STATUS_CODES[STATUSES.unauthorized] });

export { authMiddleware };