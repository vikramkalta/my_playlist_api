import base64 from 'base64url';
import crypto, { sign } from 'crypto';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

import { createBunyanLogger } from '../loaders/logger';

const signatureFunction = crypto.createSign('RSA-SHA256');
const verifyFunction = crypto.createVerify('RSA-SHA256');
const log = createBunyanLogger('JWT');

const header = {
  alg: 'RS256',
  typ: 'JWT'
};

const encrypt = payload => {
  try {
    // // The private key without line breakups
    const privKeyPath = path.resolve('id_rsa_priv.pem');
    const PRIV_KEY = fs.readFileSync(privKeyPath, 'utf8');
    const signedJwt = jwt.sign(payload, PRIV_KEY, { algorithm: 'RS256' });
    return signedJwt;
  } catch (error) {
    log.error('Error while encrypting token', error);
    throw error;
  }
};

const decrypt = async token => {
  try {
    token = token.trim();

    const pubKeyPath = path.resolve('id_rsa_pub.pem');
    const PUB_KEY = fs.readFileSync(pubKeyPath, 'utf8');
    return new Promise((resolve, reject) => {
      jwt.verify(token, PUB_KEY, { algorithms: ['RS256'] }, (err, payload) => {
        if (err?.name === 'TokenExpiredError') {
          log.error('err.name expired', err);
          return reject({
            signatureIsValid: false,
            message: 'Token expired'
          });
        }
        if (err?.name === 'JsonWebTokenError') {
          log.error('json web token error', err);
          return reject({
            signatureIsValid: false,
            message: 'Token error'
          });
        }
        if (!err) {
          log.info('payload token', payload);
          return resolve({ signatureIsValid: true, payload });
        }
        return reject({
          signatureIsValid: false,
          message: 'Token not valid.'
        });
      });
    });
  } catch (error) {
    log.error('Error while parsing token', error);
    throw { signatureIsValid: false, message: 'Invalid token.' };
  }
};
export {
  encrypt,
  decrypt
};