// database.ts - boilerplate code

import mongoose from 'mongoose';
import { config } from './index';
import { AppError } from '../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../shared/errors/errorTypes';
import { HTTP_STATUS } from '../shared/constants/httpStatus';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database.url);
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    throw new AppError(
      ErrorType.DATABASE,
      ErrorModule.SYSTEM,
      ErrorMessages[ErrorModule.SYSTEM][ErrorType.DATABASE]!.CONNECTION_FAILED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { module: ErrorModule.SYSTEM, method: 'connectDatabase' },
      { error }
    );
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  } catch (error) {
    throw new AppError(
      ErrorType.DATABASE,
      ErrorModule.SYSTEM,
      ErrorMessages[ErrorModule.SYSTEM][ErrorType.DATABASE]!.DISCONNECTION_FAILED,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { module: ErrorModule.SYSTEM, method: 'disconnectDatabase' },
      { error }
    );
  }
};
