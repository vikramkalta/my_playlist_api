import { IncomingHttpHeaders } from 'http';

interface IHttpOptions {
  headers: IncomingHttpHeaders;
  port: number;
}

const GET_HTTP_OPTIONS = (): IHttpOptions => {
  return {
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    port: 443
  };
};
export { GET_HTTP_OPTIONS };