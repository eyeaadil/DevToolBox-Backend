import app from './app.js';
import config from './config/env.js';
import logger from './config/logger.js';
import connectDB from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Connect to database
connectDB();

// Connect to Redis (optional)
// connectRedis().catch((err) => {
//   logger.warn('Redis connection failed, continuing without Redis');
// });

// Start server
const server = app.listen(config.port, () => {
  logger.info(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   🚀 DevToolBox API Server                           ║
    ║                                                       ║
    ║   Environment: ${config.env.padEnd(36)}║
    ║   Port: ${config.port.toString().padEnd(42)}║
    ║   API Version: ${config.apiVersion.padEnd(36)}║
    ║                                                       ║
    ║   Health Check: http://localhost:${config.port}/health${' '.repeat(7)}║
    ║   API Endpoint: http://localhost:${config.port}/api/${config.apiVersion}${' '.repeat(8)}║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(async () => {
    await disconnectRedis();
    logger.info('💥 Process terminated!');
  });
});

process.on('SIGINT', async () => {
  logger.info('👋 SIGINT RECEIVED. Shutting down gracefully');
  server.close(async () => {
    await disconnectRedis();
    logger.info('💥 Process terminated!');
  });
});

export default server;
