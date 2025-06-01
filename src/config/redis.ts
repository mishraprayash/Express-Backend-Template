// redis.ts - boilerplate code

import { createClient } from 'redis';
import { config } from './index';
import { AppError } from '../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../shared/errors/errorTypes';
import { HTTP_STATUS } from '../shared/constants/httpStatus';

// Create Redis client
export const redisClient = createClient({
  url: `redis://${config.redis.host}:${config.redis.port}`,
  password: config.redis.password,
});


redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
  throw new AppError(
    ErrorType.INTERNAL,
    ErrorModule.DATABASE,
    ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.CONNECTION_ERROR,
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    { module: ErrorModule.DATABASE, method: 'redisConnection' }
  );
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('📦 Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    throw new AppError(
      ErrorType.INTERNAL,
      ErrorModule.DATABASE,
      ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.CONNECTION_ERROR,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      { module: ErrorModule.DATABASE, method: 'connectRedis' }
    );
  }
};

// Disconnect from Redis
export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    console.log('Redis connection closed');
  } catch (error) {
    console.error('Failed to disconnect from Redis:', error);
    throw new AppError(
      ErrorType.INTERNAL,
      ErrorModule.DATABASE,
      ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.DISCONNECTION_FAILED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { module: ErrorModule.DATABASE, method: 'disconnectRedis' }
    );
  }
};
