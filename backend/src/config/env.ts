import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'technest_super_secret_jwt_access_token_key_2026_xYz',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'technest_super_secret_jwt_refresh_token_key_2026_aBc',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
};
