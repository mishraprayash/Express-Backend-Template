import { IUser } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';
import * as jwt from 'jsonwebtoken';
import { config } from '../../../config';
import bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    try {
      const existingUser = await this.userRepository.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError(
          ErrorType.VALIDATION,
          ErrorModule.USER,
          ErrorMessages[ErrorModule.USER][ErrorType.VALIDATION]!.DUPLICATE_EMAIL,
          HTTP_STATUS.BAD_REQUEST,
          { module: ErrorModule.USER, method: 'createUser' }
        );
      }

      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      return await this.userRepository.create(userData);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.INTERNAL]!.CREATE_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.USER, method: 'createUser' },
        { error: (error as Error).message }
      );
    }
  }

  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    try {
      const user = await this.userRepository.findOne({ email }, '+password');
      if (!user) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_CREDENTIALS,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'login' }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_CREDENTIALS,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'login' }
        );
      }

      const token = this.generateToken(user);
      return { user, token };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.AUTH,
        ErrorMessages[ErrorModule.AUTH][ErrorType.INTERNAL]!.LOGIN_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.AUTH, method: 'login' },
        { error: (error as Error).message }
      );
    }
  }

  async findUserById(id: string): Promise<IUser> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorModule.USER,
          ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          { module: ErrorModule.USER, method: 'findUserById' }
        );
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.INTERNAL]!.QUERY_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.USER, method: 'findUserById' },
        { error: (error as Error).message }
      );
    }
  }

  async updateUser(id: string, userData: Partial<IUser>): Promise<IUser> {
    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const user = await this.userRepository.findByIdAndUpdate(id, userData);
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorModule.USER,
          ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          { module: ErrorModule.USER, method: 'updateUser' }
        );
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.INTERNAL]!.UPDATE_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.USER, method: 'updateUser' },
        { error: (error as Error).message }
      );
    }
  }

  async updateUserSettings(id: string, settings: Record<string, any>): Promise<IUser> {
    try {
      const user = await this.userRepository.findByIdAndUpdate(id, {
        settings: new Map(Object.entries(settings))
      });
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorModule.USER,
          ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          { module: ErrorModule.USER, method: 'updateUserSettings' }
        );
      }
      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.INTERNAL]!.UPDATE_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.USER, method: 'updateUserSettings' },
        { error: (error as Error).message }
      );
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findByIdAndDelete(id);
      if (!user) {
        throw new AppError(
          ErrorType.NOT_FOUND,
          ErrorModule.USER,
          ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          { module: ErrorModule.USER, method: 'deleteUser' }
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        ErrorType.INTERNAL,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.INTERNAL]!.DELETE_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { module: ErrorModule.USER, method: 'deleteUser' },
        { error: (error as Error).message }
      );
    }
  }
}
