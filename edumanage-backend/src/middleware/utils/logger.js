const winston = require('winston');
const path = require('path');
const config = require('../config/env');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logs directory
const logsDir = path.join(__dirname, '../../logs');

// Create logger instance
const logger = winston.createLogger({
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'edumanage-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for HTTP requests
    new winston.transports.File({
      filename: path.join(logsDir, 'http.log'),
      level: 'http',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add Morgan-like HTTP logging
logger.httpStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Create a child logger with additional metadata
logger.child = (metadata) => {
  return winston.createLogger({
    ...logger.options,
    defaultMeta: { ...logger.defaultMeta, ...metadata }
  });
};

module.exports = logger;
