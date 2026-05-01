import { Router, Request, Response } from 'express';
import * as db from '../database';

const router = Router();

router.get('/university/:universityId', (req: Request, res: Response) => {
  const ratings = db.getRatingsByUniversity(parseInt(req.params.universityId));
  res.json({ success: true, data: ratings });
});

router.post('/university/:universityId', (req: Request, res: Response) => {
  const { category, score } = req.body;
  if (!category || score === undefined) {
    return res.status(400).json({ success: false, message: '类别和评分为必填项' });
  }
  const rating = db.upsertRating(parseInt(req.params.universityId), category, score);
  res.json({ success: true, data: rating });
});

router.put('/:id', (req: Request, res: Response) => {
  const { score } = req.body;
  const updated = db.updateRating(parseInt(req.params.id), score);
  if (!updated) {
    return res.status(404).json({ success: false, message: '评分不存在' });
  }
  res.json({ success: true, data: updated });
});

export default router;
