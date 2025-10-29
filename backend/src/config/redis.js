import { createClient } from 'redis';
import logger from './logger.js';

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (err) => {
      logger.error(`Redis Client Error: ${err}`);
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis Client Disconnected');
    });

    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error(`Redis connection error: ${error.message}`);
    logger.warn('Continuing without Redis - some features may be limited');
    return null;
  }
};

const getRedisClient = () => {
  return redisClient;
};

const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

export { connectRedis, getRedisClient, disconnectRedis };
