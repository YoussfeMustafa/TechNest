import swaggerJsdoc from 'swagger-jsdoc';
import { ENV } from './env.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TechNest E-Commerce API',
      version: '1.0.0',
      description: 'API documentation for TechNest Electronics Retail Platform (Dubai Phone Alternative)',
      contact: {
        name: 'TechNest Support',
        email: 'support@technest.local',
      },
    },
    servers: [
      {
        url: `${ENV.BASE_URL}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
