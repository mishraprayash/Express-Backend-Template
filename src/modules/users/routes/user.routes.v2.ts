import { Router } from 'express';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { userValidation } from '../validations/user.validation';
import { UserController } from '../controllers/user.controller';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', validateRequest(userValidation.register), userController.register);

router.post('/login', validateRequest(userValidation.login), userController.login);

// Protected routes
router.use(authMiddleware);

router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  userController.getProfile(req as AuthenticatedRequest, res, next);
});

router.put(
  '/profile',
  validateRequest(userValidation.updateProfile),
  (req: Request, res: Response, next: NextFunction) => {
    userController.updateProfile(req as AuthenticatedRequest, res, next);
  }
);

// New v2 endpoints
router.get('/settings', (req: Request, res: Response, next: NextFunction) => {
  userController.getSettings(req as AuthenticatedRequest, res, next);
});
router.put('/settings', (req: Request, res: Response, next: NextFunction) => {
  userController.updateSettings(req as AuthenticatedRequest, res, next);
});

export default router;
