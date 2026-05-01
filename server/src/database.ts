import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

interface University {
  id: number;
  name: string;
  logo: string;
  cover_image: string;
  description: string;
  location: string;
  type: string;
  website: string;
  established_year: number | null;
  student_count: number;
  feature_tag: string;
  created_at: string;
  updated_at: string;
}

interface Rating {
  id: number;
  university_id: number;
  category: string;
  score: number;
}

interface FeatureTag {
  id: number;
  university_id: number;
  tag_name: string;
  status: number;
  description: string;
  sort_order: number;
}

interface Comment {
  id: number;
  university_id: number;
  user_name: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  detail: string;
  timestamp: string;
}

interface TagTemplateItem {
  tag_name: string;
  status: number;
  description: string;
}

interface TagTemplate {
  id: number;
  name: string;
  description: string;
  tags: TagTemplateItem[];
  created_at: string;
  updated_at: string;
}

interface Database {
  universities: University[];
  ratings: Rating[];
  feature_tags: FeatureTag[];
  comments: Comment[];
  audit_logs: AuditLog[];
  tag_templates: TagTemplate[];
  nextId: number;
}

function loadDb(): Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial: Database = { universities: [], ratings: [], feature_tags: [], comments: [], audit_logs: [], tag_templates: [], nextId: 1 };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const db: Database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  if (!db.audit_logs) db.audit_logs = [];
  if (!db.tag_templates) db.tag_templates = [];
  for (const c of db.comments) {
    if (c.rating === undefined) c.rating = 0;
    if (!c.updated_at) c.updated_at = c.created_at;
  }
  return db;
}

function saveDb(db: Database): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function nextId(db: Database): number {
  return db.nextId++;
}

export function getUniversities(search?: string, type?: string): University[] {
  const db = loadDb();
  let result = db.universities;
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.location.toLowerCase().includes(s) ||
      u.description.toLowerCase().includes(s)
    );
  }
  if (type) {
    result = result.filter(u => u.type === type);
  }
  return result.sort((a, b) => b.id - a.id);
}

export function getUniversity(id: number): University | undefined {
  const db = loadDb();
  return db.universities.find(u => u.id === id);
}

export function createUniversity(data: Partial<University>): University {
  const db = loadDb();
  const now = new Date().toISOString();
  const uni: University = {
    id: nextId(db),
    name: data.name || '',
    logo: data.logo || '',
    cover_image: data.cover_image || '',
    description: data.description || '',
    location: data.location || '',
    type: data.type || '普通本科',
    website: data.website || '',
    established_year: data.established_year || null,
    student_count: data.student_count || 0,
    feature_tag: data.feature_tag || '',
    created_at: now,
    updated_at: now,
  };
  db.universities.push(uni);
  saveDb(db);
  return uni;
}

export function updateUniversity(id: number, data: Partial<University>): University | undefined {
  const db = loadDb();
  const idx = db.universities.findIndex(u => u.id === id);
  if (idx === -1) return undefined;
  const uni = db.universities[idx];
  Object.assign(uni, data, { updated_at: new Date().toISOString() });
  saveDb(db);
  return uni;
}

export function deleteUniversity(id: number): boolean {
  const db = loadDb();
  const idx = db.universities.findIndex(u => u.id === id);
  if (idx === -1) return false;
  db.universities.splice(idx, 1);
  db.ratings = db.ratings.filter(r => r.university_id !== id);
  db.feature_tags = db.feature_tags.filter(t => t.university_id !== id);
  db.comments = db.comments.filter(c => c.university_id !== id);
  saveDb(db);
  return true;
}

export function getRatingsByUniversity(universityId: number): Rating[] {
  const db = loadDb();
  return db.ratings.filter(r => r.university_id === universityId);
}

export function getRating(id: number): Rating | undefined {
  const db = loadDb();
  return db.ratings.find(r => r.id === id);
}

export function upsertRating(universityId: number, category: string, score: number): Rating {
  const db = loadDb();
  const existing = db.ratings.find(r => r.university_id === universityId && r.category === category);
  if (existing) {
    existing.score = score;
    saveDb(db);
    return existing;
  }
  const rating: Rating = { id: nextId(db), university_id: universityId, category, score };
  db.ratings.push(rating);
  saveDb(db);
  return rating;
}

export function updateRating(id: number, score: number): Rating | undefined {
  const db = loadDb();
  const rating = db.ratings.find(r => r.id === id);
  if (!rating) return undefined;
  rating.score = score;
  saveDb(db);
  return rating;
}

export function getTagsByUniversity(universityId: number): FeatureTag[] {
  const db = loadDb();
  return db.feature_tags.filter(t => t.university_id === universityId).sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
}

export function getTag(id: number): FeatureTag | undefined {
  const db = loadDb();
  return db.feature_tags.find(t => t.id === id);
}

export function createTag(universityId: number, data: Partial<FeatureTag>): FeatureTag {
  const db = loadDb();
  const tag: FeatureTag = {
    id: nextId(db),
    university_id: universityId,
    tag_name: data.tag_name || '',
    status: data.status !== undefined ? data.status : 1,
    description: data.description || '',
    sort_order: data.sort_order || 0,
  };
  db.feature_tags.push(tag);
  saveDb(db);
  return tag;
}

export function updateTag(id: number, data: Partial<FeatureTag>): FeatureTag | undefined {
  const db = loadDb();
  const tag = db.feature_tags.find(t => t.id === id);
  if (!tag) return undefined;
  Object.assign(tag, data);
  saveDb(db);
  return tag;
}

export function deleteTag(id: number): boolean {
  const db = loadDb();
  const idx = db.feature_tags.findIndex(t => t.id === id);
  if (idx === -1) return false;
  db.feature_tags.splice(idx, 1);
  saveDb(db);
  return true;
}

export function getCommentsByUniversity(universityId: number): Comment[] {
  const db = loadDb();
  return db.comments.filter(c => c.university_id === universityId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getAllComments(search?: string): Comment[] {
  const db = loadDb();
  let result = db.comments;
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(c =>
      c.user_name.toLowerCase().includes(s) ||
      c.content.toLowerCase().includes(s)
    );
  }
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function createComment(universityId: number, user_name: string, content: string, rating?: number): Comment {
  const db = loadDb();
  const now = new Date().toISOString();
  const comment: Comment = {
    id: nextId(db),
    university_id: universityId,
    user_name: user_name || '匿名用户',
    content,
    rating: rating || 0,
    created_at: now,
    updated_at: now,
  };
  db.comments.push(comment);
  saveDb(db);
  return comment;
}

export function updateComment(id: number, data: Partial<Comment>): Comment | undefined {
  const db = loadDb();
  const comment = db.comments.find(c => c.id === id);
  if (!comment) return undefined;
  Object.assign(comment, data, { updated_at: new Date().toISOString() });
  saveDb(db);
  return comment;
}

export function deleteComment(id: number): boolean {
  const db = loadDb();
  const idx = db.comments.findIndex(c => c.id === id);
  if (idx === -1) return false;
  db.comments.splice(idx, 1);
  saveDb(db);
  return true;
}

export function addAuditLog(action: string, target_type: string, target_id: number, detail: string): AuditLog {
  const db = loadDb();
  const log: AuditLog = {
    id: nextId(db),
    action,
    target_type,
    target_id,
    detail,
    timestamp: new Date().toISOString(),
  };
  db.audit_logs.push(log);
  saveDb(db);
  return log;
}

export function getAuditLogs(): AuditLog[] {
  const db = loadDb();
  return db.audit_logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getStats(): { universityCount: number; commentCount: number; templateCount: number } {
  const db = loadDb();
  return {
    universityCount: db.universities.length,
    commentCount: db.comments.length,
    templateCount: db.tag_templates.length,
  };
}

export function getTagTemplates(): TagTemplate[] {
  const db = loadDb();
  return db.tag_templates.sort((a, b) => b.id - a.id);
}

export function getTagTemplate(id: number): TagTemplate | undefined {
  const db = loadDb();
  return db.tag_templates.find(t => t.id === id);
}

export function createTagTemplate(data: Partial<TagTemplate>): TagTemplate {
  const db = loadDb();
  const now = new Date().toISOString();
  const tpl: TagTemplate = {
    id: nextId(db),
    name: data.name || '',
    description: data.description || '',
    tags: data.tags || [],
    created_at: now,
    updated_at: now,
  };
  db.tag_templates.push(tpl);
  saveDb(db);
  return tpl;
}

export function updateTagTemplate(id: number, data: Partial<TagTemplate>): TagTemplate | undefined {
  const db = loadDb();
  const tpl = db.tag_templates.find(t => t.id === id);
  if (!tpl) return undefined;
  if (data.name !== undefined) tpl.name = data.name;
  if (data.description !== undefined) tpl.description = data.description;
  if (data.tags !== undefined) tpl.tags = data.tags;
  tpl.updated_at = new Date().toISOString();
  saveDb(db);
  return tpl;
}

export function deleteTagTemplate(id: number): boolean {
  const db = loadDb();
  const idx = db.tag_templates.findIndex(t => t.id === id);
  if (idx === -1) return false;
  db.tag_templates.splice(idx, 1);
  saveDb(db);
  return true;
}

export function applyTemplateToUniversity(templateId: number, universityId: number): FeatureTag[] {
  const db = loadDb();
  const tpl = db.tag_templates.find(t => t.id === templateId);
  if (!tpl) return [];
  db.feature_tags = db.feature_tags.filter(t => t.university_id !== universityId);
  const created: FeatureTag[] = [];
  tpl.tags.forEach((item, idx) => {
    const tag: FeatureTag = {
      id: nextId(db),
      university_id: universityId,
      tag_name: item.tag_name,
      status: item.status,
      description: item.description || '',
      sort_order: idx,
    };
    db.feature_tags.push(tag);
    created.push(tag);
  });
  saveDb(db);
  return created;
}
