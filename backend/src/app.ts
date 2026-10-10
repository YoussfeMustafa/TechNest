import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { ENV } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import apiV1Router from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { sendError, sendSuccess } from './utils/apiResponse.js';

export const app = express();

// Security middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(morgan(ENV.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads serving
app.use('/uploads', express.static(path.resolve(ENV.UPLOAD_DIR)));

// Swagger API docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'TechNest API Documentation',
}));

// Health check
app.get('/health', (req, res) => {
  return sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount versioned API routes
app.use('/api/v1', apiV1Router);

// 404 handler
app.use((req, res) => {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
});

// Centralized error handler
app.use(errorHandler);
