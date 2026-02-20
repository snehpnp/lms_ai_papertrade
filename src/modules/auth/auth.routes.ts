import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import { requireRoles } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  loginSchema,
  changePasswordSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation';

const router = Router();

// Public
router.post('/admin/login', validate(loginSchema), authController.adminLogin);
router.post('/subadmin/login', validate(loginSchema), authController.subadminLogin);
router.post('/user/login', validate(loginSchema), authController.userLogin);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected - any authenticated user
router.post('/logout', authenticate, authController.logout);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export const authRoutes = router;
