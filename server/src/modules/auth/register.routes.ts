import { Router } from 'express';
import { registerUser } from '../user/user.register.service';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    phoneNumber: z.string().length(10),
    referralCode: z.string().optional(),
  }),
});

const router = Router();
router.post(
  '/register',
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const data = await registerUser(req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
);

export const registerRoutes = router;
