import { RESOURCE_STORAGE_KEY, type ResourceCategoryId, type ResourceFile } from './resource-hub-types';

function normalizeCategory(value: unknown): ResourceCategoryId {
  if (
    value === 'admission_strategy' ||
    value === 'school_comparison' ||
    value === 'study_material' ||
    value === 'interview_prep' ||
    value === 'other'
  ) {
    return value;
  }
  return 'other';
}

function normalizeFile(raw: ResourceFile): ResourceFile {
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? 'untitled.md'),
    fileType: raw.fileType === 'pdf' ? 'pdf' : 'md',
    categoryId: normalizeCategory(raw.categoryId),
    summary: String(raw.summary ?? ''),
    size: Number(raw.size ?? 0),
    uploadedAt: String(raw.uploadedAt ?? new Date().toISOString()),
    content: String(raw.content ?? ''),
  };
}

export function loadStoredFiles(): ResourceFile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RESOURCE_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as ResourceFile[]) : [];
    return parsed.map(normalizeFile);
  } catch {
    return [];
  }
}

export function saveStoredFiles(files: ResourceFile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(files));
  } catch {
    // ignore write error
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function formatUploadedDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '-';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}
