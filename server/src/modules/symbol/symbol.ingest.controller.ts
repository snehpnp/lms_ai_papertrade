import { Request, Response, NextFunction } from 'express';
import { runIngestion } from './contractMaster.ingest';

export async function triggerIngestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { results } = await runIngestion();
    const total = results.reduce((s, r) => s + r.count, 0);
    res.json({
      success: true,
      data: { results, total },
      message: `Ingestion complete. Total symbols upserted: ${total}`,
    });
  } catch (e) {
    next(e);
  }
}
