import { NextFunction, Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../../../shared/middleware/auth.middleware';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware';
import { userValidation } from '../validations/user.validation';
import { AuthenticatedRequest } from '../../../shared/types/express';
import { Request, Response } from 'express';

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

router.delete('/profile', (req: Request, res: Response, next: NextFunction) => {
  userController.deleteProfile(req as AuthenticatedRequest, res, next);
});

export default router;
