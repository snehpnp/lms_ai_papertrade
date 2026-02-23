import { Router } from 'express';
import { wishlistService } from './wishlist.service';
import { authenticate } from '../../middlewares/authenticate';
import { userOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { z } from 'zod';

const router = Router();
const symbolParam = z.object({ params: z.object({ symbol: z.string().min(1) }) });

router.use(authenticate, userOnly);

router.post('/:symbol', validate(symbolParam), async (req, res, next) => {
  try {
    const data = await wishlistService.add(req.user!.id, req.params.symbol);
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.delete('/:symbol', validate(symbolParam), async (req, res, next) => {
  try {
    const data = await wishlistService.remove(req.user!.id, req.params.symbol);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const data = await wishlistService.list(req.user!.id);
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

export const wishlistRoutes = router;
