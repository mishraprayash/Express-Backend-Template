import { IUser } from '../models/user.model';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { UserRepository } from '../repositories/user.repository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const existingUser = await this.userRepository.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError(
        ErrorType.CONFLICT,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.CONFLICT]!.DUPLICATE_EMAIL,
        400,
        { module: ErrorModule.USER, method: 'createUser' }
      );
    }

    return this.userRepository.create(userData);
  }

  async findUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
        404,
        { module: ErrorModule.USER, method: 'findUserById' },
        { id }
      );
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<IUser> {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
        404,
        { module: ErrorModule.USER, method: 'findUserByEmail' },
        { email }
      );
    }
    return user;
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    const user = await this.userRepository.findByIdAndUpdate(id, data);
    if (!user) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
        404,
        { module: ErrorModule.USER, method: 'updateUser' }
      );
    }
    return user;
  }

  async updateUserSettings(id: string, settings: Record<string, string | boolean | undefined>): Promise<IUser> {
    const user = await this.userRepository.findByIdAndUpdate(id, { settings });
    if (!user) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
        404,
        { module: ErrorModule.USER, method: 'updateUserSettings' }
      );
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findByIdAndDelete(id);
    if (!user) {
      throw new AppError(
        ErrorType.NOT_FOUND,
        ErrorModule.USER,
        ErrorMessages[ErrorModule.USER][ErrorType.NOT_FOUND]!.USER_NOT_FOUND,
        404,
        { module: ErrorModule.USER, method: 'deleteUser' },
        { id }
      );
    }
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await this.findUserByEmail(email);
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError(
        ErrorType.AUTHENTICATION,
        ErrorModule.AUTH,
        ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_CREDENTIALS,
        401,
        { module: ErrorModule.AUTH, method: 'login' },
        { email }
      );
    }
    const token = this.generateToken(user);
    return { user, token };
  }

  private generateToken(user: IUser): string {
    const payload = { id: user._id, email: user.email, role: user.role };
    const options = { expiresIn: '1d' } as const;
    return jwt.sign(payload, config.jwt.secret, options);
  }
}
