import { Router } from 'express';
import { watchlistController } from './watchlist.controller';
import { authenticate } from '../../middlewares/authenticate';
import { userOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import {
    createWatchlistSchema,
    updateWatchlistSchema,
    watchlistIdSchema,
    addSymbolSchema,
    removeSymbolSchema,
} from './watchlist.validation';

const router = Router();

router.get('/', authenticate, userOnly, watchlistController.getWatchlists);
router.post('/', authenticate, userOnly, validate(createWatchlistSchema), watchlistController.createWatchlist);
router.put('/:id', authenticate, userOnly, validate(updateWatchlistSchema), watchlistController.updateWatchlist);
router.delete('/:id', authenticate, userOnly, validate(watchlistIdSchema), watchlistController.deleteWatchlist);

router.post('/:id/symbols', authenticate, userOnly, validate(addSymbolSchema), watchlistController.addSymbol);
router.delete('/:id/symbols/:symbolId', authenticate, userOnly, validate(removeSymbolSchema), watchlistController.removeSymbol);

export const watchlistRoutes = router;
