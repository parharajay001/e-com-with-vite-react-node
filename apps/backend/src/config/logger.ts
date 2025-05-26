/* eslint-disable no-console */
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { envConfig } from './envConfig';

// Define severity levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define different colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston that we want to link the colors
winston.addColors(colors);

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`,
  ),
);

// Create rotating file transport for info logs
const infoRotateTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

// Create rotating file transport for error logs
const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
});

// Add error handlers for the transports
infoRotateTransport.on('rotate', function (oldFilename, newFilename) {
  console.log('Log file rotated:', oldFilename, newFilename);
});

errorRotateTransport.on('rotate', function (oldFilename, newFilename) {
  console.log('Error log file rotated:', oldFilename, newFilename);
});

// Create the logger
const logger = winston.createLogger({
  level: envConfig.logLevel,
  levels,
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize({ all: true })),
    }),
    infoRotateTransport,
    errorRotateTransport,
  ],
  // Prevent winston from exiting on error
  exitOnError: false,
});

// Handle any transport errors
logger.on('error', (error) => {
  console.error('Logger error:', error);
});

export default logger;
