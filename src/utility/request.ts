import { request } from 'https';
import { request as httpRequest } from 'http';

import { getContext } from '../loaders/context';
import { createBunyanLogger } from '../loaders/logger';

const log = createBunyanLogger('Request logger');

const https = async (options, data, shouldGetRequestId = true, isHttp = false) => {
  let _request
  if (isHttp) {
    _request = httpRequest;
  } else {
    _request = request;
  }

  if (handleWriteMethods(options) && data) {
    data = JSON.stringify(data);
    options.headers['Content-Length'] = data.length;
    shouldGetRequestId && (options.headers['RequestId'] = getContext().id);
  }

  return new Promise((resolve, reject) => {
    const req = _request(options, res => {
      let response: any = '';

      res.on('data', result => {
        response += result.toString();
      });

      res.on('end', () => {
        try {
          log.info('Response from api:', response);
          response = JSON.parse(response);
          if (response.status >= 400)
            return reject(response);
          resolve(response);
        } catch (error) {
          if (error instanceof SyntaxError)
            return reject(response);
          reject(error);
        }
      })
    });

    req.on('error', err => {
      log.error('Error in http request:', err);
      return reject(err)
    });

    if (handleWriteMethods(options) && data) {
      req.write(data);
    }
    req.end();
  });
}

export { https };

function handleWriteMethods(options) {
  return ['POST', 'PUT'].includes(options.method) || options.path.includes('/api/v5/otp');
}