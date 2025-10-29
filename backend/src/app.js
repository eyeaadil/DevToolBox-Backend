import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/env.js';
import logger from './config/logger.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { generalLimiter } from './middlewares/rateLimiter.js';

// Create Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Compression middleware
app.use(compression());

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    })
  );
}

// Rate limiting
app.use('/api', generalLimiter);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.get(`/api/${config.apiVersion}`, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DevToolBox API',
    version: config.apiVersion,
    documentation: '/api-docs',
  });
});

// Import routes
import authRoutes from './routes/auth.routes.js';

// Mount routes
app.use(`/api/${config.apiVersion}/auth`, authRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
