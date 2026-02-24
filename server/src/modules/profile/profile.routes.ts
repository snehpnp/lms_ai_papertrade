import { Router } from 'express';
import { profileController } from './profile.controller';
import { authenticate } from '../../middlewares/authenticate';
import { userOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { updateProfileSchema, updatePasswordSchema } from './profile.validation';

const router = Router();
router.use(authenticate); // Allow all users (ADMIN, SUBADMIN, USER) to access their profile

router.get('/profile', profileController.getProfile);
router.patch('/profile', validate(updateProfileSchema), profileController.updateProfile);
router.patch('/profile/password', validate(updatePasswordSchema), profileController.updatePassword);
router.patch('/profile/toggle-mode', profileController.toggleMode);

export const profileRoutes = router;
