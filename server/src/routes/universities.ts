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
  const { name, tags, template_id } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: '大学名称为必填项' });
  }
  const uniData: Record<string, unknown> = {
    name, type: req.body.type, location: req.body.location,
    description: req.body.description, website: req.body.website,
    established_year: req.body.established_year,
    student_count: req.body.student_count,
    feature_tag: req.body.feature_tag,
    logo: req.body.logo || '',
    cover_image: req.body.cover_image || '',
  };
  const newUni = db.createUniversity(uniData as Parameters<typeof db.createUniversity>[0]);
  if (template_id) {
    db.applyTemplateToUniversity(parseInt(template_id), newUni.id);
    db.addAuditLog('CREATE', 'university', newUni.id, `创建大学: ${name}，应用标签模板ID ${template_id}`);
  } else if (tags && Array.isArray(tags) && tags.length > 0) {
    tags.forEach((tag: { tag_name: string; status: number; description?: string }, idx: number) => {
      db.createTag(newUni.id, { tag_name: tag.tag_name, status: tag.status, description: tag.description || '', sort_order: idx });
    });
  }
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
