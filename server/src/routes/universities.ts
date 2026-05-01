import { Router, Request, Response } from 'express';
import * as db from '../database';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { search, type } = req.query;
  const universities = db.getUniversities(search as string, type as string);

  const data = universities.map(uni => {
    const ratings = db.getRatingsByUniversity(uni.id);
    const ratingMap: Record<string, number> = {};
    ratings.forEach(r => { ratingMap[r.category] = r.score; });
    const avgScore = ratings.length > 0
      ? Math.round((ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length) * 10) / 10
      : 0;
    return { ...uni, ratings: ratingMap, avgScore };
  });

  res.json({ success: true, data });
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const uni = db.getUniversity(id);
  if (!uni) {
    return res.status(404).json({ success: false, message: '大学不存在' });
  }

  const ratings = db.getRatingsByUniversity(id);
  const tags = db.getTagsByUniversity(id);
  const comments = db.getCommentsByUniversity(id);

  res.json({ success: true, data: { ...uni, ratings, tags, comments } });
});

router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: '大学名称为必填项' });
  }
  const newUni = db.createUniversity(req.body);
  res.status(201).json({ success: true, data: newUni });
});

router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updated = db.updateUniversity(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '大学不存在' });
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const deleted = db.deleteUniversity(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '大学不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

export default router;
