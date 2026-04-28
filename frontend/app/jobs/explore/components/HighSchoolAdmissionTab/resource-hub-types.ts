export type ResourceFileType = 'md' | 'pdf';

export type ResourceCategoryId =
  | 'admission_strategy'
  | 'school_comparison'
  | 'study_material'
  | 'interview_prep'
  | 'mental_health'
  | 'parent_guide'
  | 'special_institutions'
  | 'ai_career_pivot'
  | 'policy_2028'
  | 'other';

export type ResourceCategory = {
  id: ResourceCategoryId;
  label: string;
  color: string;
};

export type ResourceFile = {
  id: string;
  name: string;
  fileType: ResourceFileType;
  categoryId: ResourceCategoryId;
  summary: string;
  size: number;
  uploadedAt: string;
  content: string;
};

export type ResourceLibraryDocument = {
  id: string;
  categoryId: ResourceCategoryId;
  title: string;
  summary: string;
  markdownPath: string;
  tags: string[];
};

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  { id: 'admission_strategy', label: '입시전략', color: '#60a5fa' },
  { id: 'school_comparison', label: '학교비교', color: '#a78bfa' },
  { id: 'study_material', label: '학습자료', color: '#34d399' },
  { id: 'interview_prep', label: '면접준비', color: '#f59e0b' },
  { id: 'mental_health', label: '멘탈관리', color: '#22d3ee' },
  { id: 'parent_guide', label: '학부모가이드', color: '#fb7185' },
  { id: 'special_institutions', label: '특수기관', color: '#f97316' },
  { id: 'ai_career_pivot', label: 'AI 진로 대응', color: '#10b981' },
  { id: 'policy_2028', label: '2028 개편 정리', color: '#eab308' },
  { id: 'other', label: '기타', color: '#9ca3af' },
];

export const RESOURCE_STORAGE_KEY = 'high_school_resource_hub_v3';
