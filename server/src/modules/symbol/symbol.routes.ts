import { Router } from 'express';
import { symbolController } from './symbol.controller';
import { triggerIngestion } from './symbol.ingest.controller';
import { authenticate } from '../../middlewares/authenticate';
import { adminOnly } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { searchSymbolsSchema, symbolIdParamSchema } from './symbol.validation';

const router = Router();

// Public: search and get symbol (indexed for fast search)
router.get('/', validate(searchSymbolsSchema), symbolController.search);
router.get('/:id', validate(symbolIdParamSchema), symbolController.getById);

// Admin only: trigger contract master CSV fetch and upsert
router.post('/ingest', authenticate, adminOnly, triggerIngestion);
// Admin only: truncate Symbol table (delete all rows)
router.delete('/truncate', authenticate, adminOnly, symbolController.truncate);

export const symbolRoutes = router;
