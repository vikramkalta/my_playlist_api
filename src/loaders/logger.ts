import { createLogger } from 'bunyan';

const env = process.env.NODE_ENV;
const createBunyanLogger = (loggerName: string): ILogObject => {
  const logLevelObj = {
    testing: 'warn',
    production: 'info'
  };

  const bunyanConfig = {
    name: loggerName,
    level: env && logLevelObj[env] ? logLevelObj[env] : 'trace'
  };

  const logger = createLogger(bunyanConfig);

  const constructLogObj = (level: string): InnerConstructLogFunction => {
    return (...args) => {
      logger[level](...args);
    };
  };

  const logObj = {
    info: constructLogObj('info'),
    trace: constructLogObj('trace'),
    debug: constructLogObj('debug'),
    warn: constructLogObj('warn'),
    error: constructLogObj('error'),
    fatal: constructLogObj('fatal')
  };

  return logObj;
};

export { createBunyanLogger };

interface ILogObject {
  info: InnerConstructLogFunction;
  trace: InnerConstructLogFunction;
  debug: InnerConstructLogFunction;
  warn: InnerConstructLogFunction;
  error: InnerConstructLogFunction;
  fatal: InnerConstructLogFunction;
}

type InnerConstructLogFunction = (...args) => void;
