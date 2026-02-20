import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middlewares/authenticate';
import { adminOrSubadmin } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  listUsersSchema,
} from './user.validation';

const router = Router();

router.use(authenticate, adminOrSubadmin);

router.get('/', validate(listUsersSchema), userController.list);
router.post('/', validate(createUserSchema), userController.create);
router.get('/:id', validate(userIdParamSchema), userController.getOne);
router.patch('/:id', validate(updateUserSchema), userController.update);
router.delete('/:id', validate(userIdParamSchema), userController.delete);
router.post('/:id/block', validate(userIdParamSchema), userController.block);
router.post('/:id/unblock', validate(userIdParamSchema), userController.unblock);
router.get('/:id/activity', validate(userIdParamSchema), userController.activityReport);
router.get('/:id/trading-report', validate(userIdParamSchema), userController.tradingReport);
router.get('/:id/course-progress', validate(userIdParamSchema), userController.courseProgress);

export const userRoutes = router;
