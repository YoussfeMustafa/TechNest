import dotenv from 'dotenv';
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function requiredProductionEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (isProduction && !value) {
    throw new Error(`Missing required environment variable ${name} in production.`);
  }
  return value || fallback || '';
}

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: nodeEnv,
  DATABASE_URL: requiredProductionEnv('DATABASE_URL'),
  JWT_SECRET: requiredProductionEnv('JWT_SECRET', 'development_access_secret_change_me'),
  JWT_REFRESH_SECRET: requiredProductionEnv('JWT_REFRESH_SECRET', 'development_refresh_secret_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  UPLOAD_DIR: process.env.VERCEL ? '/tmp/uploads' : process.env.UPLOAD_DIR || './uploads',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
};
