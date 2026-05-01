import type { ApiResponse, UniversityListItem, UniversityDetail, University, Rating, FeatureTag, Comment, AuditLog, TagTemplate } from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Request failed');
  }
  return json.data;
}

export const api = {
  getUniversities(search?: string, type?: string): Promise<UniversityListItem[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    const qs = params.toString();
    return request<UniversityListItem[]>(`/universities${qs ? `?${qs}` : ''}`);
  },

  getUniversity(id: number): Promise<UniversityDetail> {
    return request<UniversityDetail>(`/universities/${id}`);
  },

  createUniversity(data: Partial<University>): Promise<University> {
    return request<University>('/universities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateUniversity(id: number, data: Partial<University>): Promise<University> {
    return request<University>(`/universities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteUniversity(id: number): Promise<void> {
    return request<void>(`/universities/${id}`, { method: 'DELETE' });
  },

  getRatings(universityId: number): Promise<Rating[]> {
    return request<Rating[]>(`/ratings/university/${universityId}`);
  },

  upsertRating(universityId: number, category: string, score: number): Promise<Rating> {
    return request<Rating>(`/ratings/university/${universityId}`, {
      method: 'POST',
      body: JSON.stringify({ category, score }),
    });
  },

  updateRating(id: number, score: number): Promise<Rating> {
    return request<Rating>(`/ratings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ score }),
    });
  },

  getTags(universityId: number): Promise<FeatureTag[]> {
    return request<FeatureTag[]>(`/tags/university/${universityId}`);
  },

  createTag(universityId: number, data: Partial<FeatureTag>): Promise<FeatureTag> {
    return request<FeatureTag>(`/tags/university/${universityId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTag(id: number, data: Partial<FeatureTag>): Promise<FeatureTag> {
    return request<FeatureTag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTag(id: number): Promise<void> {
    return request<void>(`/tags/${id}`, { method: 'DELETE' });
  },

  getComments(universityId: number): Promise<Comment[]> {
    return request<Comment[]>(`/comments/university/${universityId}`);
  },

  getAllComments(search?: string): Promise<Comment[]> {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    return request<Comment[]>(`/comments/all${params.toString() ? `?${params}` : ''}`);
  },

  createComment(universityId: number, user_name: string, content: string, rating?: number): Promise<Comment> {
    return request<Comment>(`/comments/university/${universityId}`, {
      method: 'POST',
      body: JSON.stringify({ user_name, content, rating }),
    });
  },

  updateComment(id: number, data: Partial<Comment>): Promise<Comment> {
    return request<Comment>(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteComment(id: number): Promise<void> {
    return request<void>(`/comments/${id}`, { method: 'DELETE' });
  },

  getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/comments/audit/logs');
  },

  getTagTemplates(): Promise<TagTemplate[]> {
    return request<TagTemplate[]>('/templates');
  },

  getTagTemplate(id: number): Promise<TagTemplate> {
    return request<TagTemplate>(`/templates/${id}`);
  },

  createTagTemplate(data: Partial<TagTemplate>): Promise<TagTemplate> {
    return request<TagTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTagTemplate(id: number, data: Partial<TagTemplate>): Promise<TagTemplate> {
    return request<TagTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTagTemplate(id: number): Promise<void> {
    return request<void>(`/templates/${id}`, { method: 'DELETE' });
  },

  applyTemplate(templateId: number, universityId: number): Promise<FeatureTag[]> {
    return request<FeatureTag[]>(`/templates/${templateId}/apply/${universityId}`, { method: 'POST' });
  },
};
