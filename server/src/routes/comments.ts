import { Router, Request, Response } from 'express';
import * as db from '../database';

const router = Router();

router.get('/all', (req: Request, res: Response) => {
  const { search } = req.query;
  const comments = db.getAllComments(search as string);
  res.json({ success: true, data: comments });
});

router.get('/university/:universityId', (req: Request, res: Response) => {
  const comments = db.getCommentsByUniversity(parseInt(req.params.universityId));
  res.json({ success: true, data: comments });
});

router.post('/university/:universityId', (req: Request, res: Response) => {
  const { user_name, content, rating } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: '评论内容为必填项' });
  }
  const uniId = parseInt(req.params.universityId);
  const comment = db.createComment(uniId, user_name, content, rating);
  db.addAuditLog('CREATE', 'comment', comment.id, `创建评论: ${user_name || '匿名'} 在大学ID ${uniId}`);
  res.status(201).json({ success: true, data: comment });
});

router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updated = db.updateComment(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '评论不存在' });
  }
  db.addAuditLog('UPDATE', 'comment', id, `更新评论ID ${id}`);
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const deleted = db.deleteComment(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '评论不存在' });
  }
  db.addAuditLog('DELETE', 'comment', id, `删除评论ID ${id}`);
  res.json({ success: true, message: '删除成功' });
});

router.get('/audit/logs', (_req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({ success: true, data: logs });
});

export default router;
