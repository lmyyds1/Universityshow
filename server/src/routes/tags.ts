import { Router, Request, Response } from 'express';
import * as db from '../database';

const router = Router();

router.get('/university/:universityId', (req: Request, res: Response) => {
  const tags = db.getTagsByUniversity(parseInt(req.params.universityId));
  res.json({ success: true, data: tags });
});

router.post('/university/:universityId', (req: Request, res: Response) => {
  const { tag_name } = req.body;
  if (!tag_name) {
    return res.status(400).json({ success: false, message: '标签名称为必填项' });
  }
  const tag = db.createTag(parseInt(req.params.universityId), req.body);
  res.status(201).json({ success: true, data: tag });
});

router.put('/:id', (req: Request, res: Response) => {
  const updated = db.updateTag(parseInt(req.params.id), req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '标签不存在' });
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  const deleted = db.deleteTag(parseInt(req.params.id));
  if (!deleted) {
    return res.status(404).json({ success: false, message: '标签不存在' });
  }
  res.json({ success: true, message: '删除成功' });
});

export default router;
