import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../../../shared/middleware/auth.middleware';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware';
import { userValidation } from '../validations/user.validation';

const router = Router();
const userController = new UserController();

// Public routes
router.post(
  '/register',
  validateRequest(userValidation.register),
  userController.register
);

router.post(
  '/login',
  validateRequest(userValidation.login),
  userController.login
);

// Protected routes
router.use(authenticate);

router.get('/profile', userController.getProfile);
router.patch(
  '/profile',
  validateRequest(userValidation.updateProfile),
  userController.updateProfile
);
router.patch(
  '/settings',
  validateRequest(userValidation.updateSettings),
  userController.updateSettings
);
router.delete('/profile', userController.deleteProfile);

export default router;
