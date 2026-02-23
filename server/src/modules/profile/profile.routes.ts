import { Router } from 'express';
import { profileController } from './profile.controller';
import { authenticate } from '../../middlewares/authenticate';
import { userOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { updateProfileSchema } from './profile.validation';

const router = Router();
router.use(authenticate, userOnly);

router.get('/profile', profileController.getProfile);
router.patch('/profile', validate(updateProfileSchema), profileController.updateProfile);

export const profileRoutes = router;
