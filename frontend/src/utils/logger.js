// Simple logger utility that gates logs in production
// Usage: import logger from '../utils/logger'; logger.debug('msg', data);

const isDev = import.meta.env?.MODE !== 'production';

const noop = () => {};

const logger = {
  debug: isDev ? console.debug.bind(console) : noop,
  log: isDev ? console.log.bind(console) : noop,
  info: isDev ? console.info.bind(console) : noop,
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

export default logger;
