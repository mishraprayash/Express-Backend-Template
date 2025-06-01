import { IUser } from '../models/user.model';
import { User } from '../models/user.model';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import mongoose from 'mongoose';

export class UserRepository {
  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new AppError(
          ErrorType.VALIDATION,
          ErrorModule.USER,
          ErrorMessages[ErrorModule.USER][ErrorType.VALIDATION]!.INVALID_INPUT,
          HTTP_STATUS.BAD_REQUEST,
          { module: ErrorModule.USER, method: 'create' },
          { details: error.message }
        );
      }
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.DATABASE,
        ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.QUERY_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.DATABASE, method: 'create' },
        { error: (error as Error).message }
      );
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.DATABASE,
        ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.QUERY_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.DATABASE, method: 'findById' },
        { error: (error as Error).message }
      );
    }
  }

  async findOne(query: Record<string, unknown>, select?: string): Promise<IUser | null> {
    try {
      const queryBuilder = User.findOne(query);
      if (select) {
        queryBuilder.select(select);
      }
      return await queryBuilder.exec();
    } catch (error) {
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.DATABASE,
        ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.QUERY_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.DATABASE, method: 'findOne' },
        { error: (error as Error).message }
      );
    }
  }

  async find(filter: mongoose.FilterQuery<IUser>): Promise<IUser[]> {
    return User.find(filter);
  }

  async findByIdAndUpdate(id: string, data: Partial<IUser> | { $set: Partial<IUser> }): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    } catch (error) {
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.DATABASE,
        ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.QUERY_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.DATABASE, method: 'findByIdAndUpdate' },
        { error: (error as Error).message }
      );
    }
  }

  async findByIdAndDelete(id: string): Promise<IUser | null> {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.DATABASE,
        ErrorMessages[ErrorModule.DATABASE][ErrorType.INTERNAL]!.QUERY_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.DATABASE, method: 'findByIdAndDelete' },
        { error: (error as Error).message }
      );
    }
  }
}
