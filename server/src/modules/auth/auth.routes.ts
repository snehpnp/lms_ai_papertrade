import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import { requireRoles } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  loginSchema,
  commonLoginSchema,
  changePasswordSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from './auth.validation';

const router = Router();

// Public config (Google Client ID, etc.)
router.get('/config', authController.getConfig);

// Public - Common login (all roles)
router.post('/login', validate(commonLoginSchema), authController.login);

// Legacy endpoints (kept for backward compatibility)
router.post('/admin/login', validate(loginSchema), authController.adminLogin);
router.post('/subadmin/login', validate(loginSchema), authController.subadminLogin);
router.post('/user/login', validate(loginSchema), authController.userLogin);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/google', validate(googleLoginSchema), authController.googleLogin);

// Protected - any authenticated user
router.post('/logout', authenticate, authController.logout);
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);

export const authRoutes = router;
