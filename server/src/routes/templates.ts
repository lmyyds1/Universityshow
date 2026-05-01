import { Router, Request, Response } from 'express';
import * as db from '../database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const templates = db.getTagTemplates();
  res.json({ success: true, data: templates });
});

router.get('/:id', (req: Request, res: Response) => {
  const tpl = db.getTagTemplate(parseInt(req.params.id));
  if (!tpl) {
    return res.status(404).json({ success: false, message: '模板不存在' });
  }
  res.json({ success: true, data: tpl });
});

router.post('/', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: '模板名称为必填项' });
  }
  const tpl = db.createTagTemplate(req.body);
  db.addAuditLog('CREATE', 'tag_template', tpl.id, `创建标签模板: ${name}`);
  res.status(201).json({ success: true, data: tpl });
});

router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updated = db.updateTagTemplate(id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: '模板不存在' });
  }
  db.addAuditLog('UPDATE', 'tag_template', id, `更新标签模板: ${updated.name}`);
  res.json({ success: true, data: updated });
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const deleted = db.deleteTagTemplate(id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: '模板不存在' });
  }
  db.addAuditLog('DELETE', 'tag_template', id, `删除标签模板ID ${id}`);
  res.json({ success: true, message: '删除成功' });
});

router.post('/:id/apply/:universityId', (req: Request, res: Response) => {
  const templateId = parseInt(req.params.id);
  const universityId = parseInt(req.params.universityId);
  const tags = db.applyTemplateToUniversity(templateId, universityId);
  db.addAuditLog('APPLY', 'tag_template', templateId, `将模板ID ${templateId} 应用到大学ID ${universityId}，生成${tags.length}个标签`);
  res.json({ success: true, data: tags });
});

export default router;
