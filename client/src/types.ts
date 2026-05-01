export interface University {
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

export interface Rating {
  id: number;
  university_id: number;
  category: string;
  score: number;
}

export interface FeatureTag {
  id: number;
  university_id: number;
  tag_name: string;
  status: number;
  description: string;
  sort_order: number;
}

export interface Comment {
  id: number;
  university_id: number;
  user_name: string;
  content: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  target_type: string;
  target_id: number;
  detail: string;
  timestamp: string;
}

export interface TagTemplateItem {
  tag_name: string;
  status: number;
  description: string;
}

export interface TagTemplate {
  id: number;
  name: string;
  description: string;
  tags: TagTemplateItem[];
  created_at: string;
  updated_at: string;
}

export interface UniversityListItem extends University {
  ratings: Record<string, number>;
  avgScore: number;
}

export interface UniversityDetail extends University {
  ratings: Rating[];
  tags: FeatureTag[];
  comments: Comment[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
