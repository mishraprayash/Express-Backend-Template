import dotenv from 'dotenv';
import { z } from 'zod';
import { AppError } from '../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../shared/errors/errorTypes';
import { HTTP_STATUS } from '../shared/constants/httpStatus';
import path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT secret is required'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
});

let config: {
  env: 'development' | 'production' | 'test';
  port: number;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  mongo: {
    uri: string;
  };
};

try {
  const env = envSchema.parse(process.env);
  config = {
    env: env.NODE_ENV,
    port: parseInt(env.PORT, 10),
    database: {
      url: env.DATABASE_URL,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
    redis: {
      host: env.REDIS_HOST,
      port: parseInt(env.REDIS_PORT, 10),
      password: env.REDIS_PASSWORD,
    },
    mongo: {
      uri: env.DATABASE_URL,
    },
  };
} catch (error) {
  if (error instanceof z.ZodError) {
    const messages = error.errors.map((e) => e.message);
    throw new AppError(
      ErrorType.VALIDATION,
      ErrorModule.SYSTEM,
      ErrorMessages[ErrorModule.SYSTEM][ErrorType.VALIDATION]!.INVALID_CONFIG,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { module: ErrorModule.SYSTEM, method: 'config' },
      { details: messages }
    );
  }
  throw error;
}

export { config };
export type Config = typeof config;
