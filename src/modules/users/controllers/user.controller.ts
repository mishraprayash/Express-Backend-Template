import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { AppError } from '../../../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../../../shared/errors/errorTypes';
import { HTTP_STATUS } from '../../../shared/constants/httpStatus';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.userService.login(email, password);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: { user, token },
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'getProfile' }
        );
      }
      const user = await this.userService.findUserById(req.user.id);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'updateProfile' }
        );
      }
      const user = await this.userService.updateUser(req.user.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'updateSettings' }
        );
      }
      const { settings } = req.body;
      const user = await this.userService.updateUserSettings(req.user.id, settings);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'deleteProfile' }
        );
      }
      await this.userService.deleteUser(req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  getSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new AppError(
          ErrorType.AUTHENTICATION,
          ErrorModule.AUTH,
          ErrorMessages[ErrorModule.AUTH][ErrorType.AUTHENTICATION]!.INVALID_TOKEN,
          HTTP_STATUS.UNAUTHORIZED,
          { module: ErrorModule.AUTH, method: 'getSettings' }
        );
      }
      const user = await this.userService.findUserById(req.user.id);
      res.status(HTTP_STATUS.OK).json({
        status: 'success',
        data: {
          settings: user.settings || {},
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
