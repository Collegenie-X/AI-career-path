'use client';

import { useMemo, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { RESOURCE_CATEGORIES, type ResourceCategoryId, type ResourceFileType } from './resource-hub-types';

type HighSchoolResourceFormPayload = {
  title: string;
  summary: string;
  categoryId: ResourceCategoryId;
  fileName: string;
  fileType: ResourceFileType;
  content: string;
  size: number;
};

type HighSchoolResourceFormDialogProps = {
  defaultCategoryId: ResourceCategoryId;
  onClose: () => void;
  onSubmit: (payload: HighSchoolResourceFormPayload) => void;
};

type UploadedAttachment = {
  fileName: string;
  fileType: ResourceFileType;
  content: string;
  size: number;
};

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('read-text-failed'));
    reader.readAsText(file, 'utf-8');
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('read-binary-failed'));
    reader.readAsDataURL(file);
  });
}

function inferFileType(fileName: string): ResourceFileType | null {
  const lowerFileName = fileName.toLowerCase();
  if (lowerFileName.endsWith('.md')) return 'md';
  if (lowerFileName.endsWith('.pdf')) return 'pdf';
  return null;
}

export function HighSchoolResourceFormDialog({
  defaultCategoryId,
  onClose,
  onSubmit,
}: HighSchoolResourceFormDialogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<ResourceCategoryId>(defaultCategoryId);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [uploadedAttachment, setUploadedAttachment] = useState<UploadedAttachment | null>(null);
  const [isLoadingAttachment, setIsLoadingAttachment] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim().length > 0 && summary.trim().length > 0, [title, summary]);

  const handlePickFile = async (file: File | null) => {
    if (!file) return;
    const inferredFileType = inferFileType(file.name);
    if (!inferredFileType) {
      setValidationMessage('MD 또는 PDF 파일만 업로드할 수 있습니다.');
      return;
    }

    setValidationMessage(null);
    setIsLoadingAttachment(true);
    try {
      const content = inferredFileType === 'md'
        ? await readFileAsText(file)
        : await readFileAsDataUrl(file);

      setUploadedAttachment({
        fileName: file.name,
        fileType: inferredFileType,
        content,
        size: file.size,
      });
    } catch {
      setValidationMessage('파일을 읽지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoadingAttachment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 80px)', marginBottom: 80 }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-black text-white">자료 추가</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-10 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">카테고리</label>
            <div className="grid grid-cols-3 gap-2">
              {RESOURCE_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className="rounded-xl py-2 text-xs font-bold transition-all"
                  style={selectedCategoryId === category.id
                    ? { background: `linear-gradient(135deg, ${category.color}30, ${category.color}12)`, border: `1px solid ${category.color}55`, color: category.color }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">제목</label>
            <input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="예: 일반고/특목고 입시 전략 비교"
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">요약</label>
            <textarea
              value={summary}
              onChange={event => setSummary(event.target.value)}
              placeholder="자료 핵심 내용을 짧게 적어 주세요."
              className="w-full min-h-24 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 block">파일</label>
            <label className="w-full h-12 rounded-xl border border-dashed border-indigo-400/40 flex items-center justify-center gap-2 text-sm text-indigo-200 cursor-pointer">
              <Upload className="w-4 h-4" />
              {isLoadingAttachment ? '파일 읽는 중...' : 'MD/PDF 업로드'}
              <input
                type="file"
                accept=".md,.pdf"
                className="hidden"
                onChange={event => {
                  void handlePickFile(event.target.files?.[0] ?? null);
                  event.target.value = '';
                }}
              />
            </label>
            {uploadedAttachment && (
              <p className="text-xs text-gray-400">
                첨부됨: {uploadedAttachment.fileName}
              </p>
            )}
          </div>

          {validationMessage && <p className="text-xs text-red-400">{validationMessage}</p>}

          <button
            onClick={() => {
              if (!canSubmit) {
                setValidationMessage('제목과 요약을 입력해 주세요.');
                return;
              }
              if (!uploadedAttachment) {
                setValidationMessage('업로드 파일 또는 새 MD를 선택해 주세요.');
                return;
              }
              setValidationMessage(null);
              onSubmit({
                title: title.trim(),
                summary: summary.trim(),
                categoryId: selectedCategoryId,
                fileName: uploadedAttachment.fileName,
                fileType: uploadedAttachment.fileType,
                content: uploadedAttachment.content,
                size: uploadedAttachment.size,
              });
            }}
            disabled={isLoadingAttachment}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            자료 등록
          </button>
        </div>
      </div>
    </div>
  );
}
