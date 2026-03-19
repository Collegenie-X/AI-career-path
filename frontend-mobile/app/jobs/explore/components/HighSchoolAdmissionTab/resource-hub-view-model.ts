import type { ResourceCategoryId, ResourceFileType } from './resource-hub-types';

export type ResourceListItem = {
  id: string;
  title: string;
  summary: string;
  categoryId: ResourceCategoryId;
  fileType: ResourceFileType;
  source: 'library' | 'user';
  uploadedAt: string;
  size: number;
  tags: string[];
  markdownPath?: string;
  content?: string;
};
