'use client';

import { useMemo, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { LABELS, RESOURCE_CATEGORIES } from '../config';
import type { DreamResource, ResourceCategoryId } from '../types';

export interface DreamLibraryResourceFormPayload {
  category: ResourceCategoryId;
  title: string;
  description: string;
  resourceUrl?: string;
  tags: string[];
  attachmentFileName?: string;
  attachmentFileType?: 'md' | 'pdf';
  attachmentMarkdownContent?: string;
  attachmentDataUrl?: string;
}

interface DreamLibraryResourceFormDialogProps {
  title: string;
  submitLabel: string;
  initialResource?: DreamResource;
  onClose: () => void;
  onSubmit: (payload: DreamLibraryResourceFormPayload) => void;
}

function inferAttachmentFileType(fileName: string): 'md' | 'pdf' | null {
  const lowerCaseFileName = fileName.toLowerCase();
  if (lowerCaseFileName.endsWith('.md')) return 'md';
  if (lowerCaseFileName.endsWith('.pdf')) return 'pdf';
  return null;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read text file.'));
    reader.readAsText(file, 'utf-8');
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read binary file.'));
    reader.readAsDataURL(file);
  });
}

export function DreamLibraryResourceFormDialog({
  title,
  submitLabel,
  initialResource,
  onClose,
  onSubmit,
}: DreamLibraryResourceFormDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategoryId>(initialResource?.category ?? 'study');
  const [resourceTitle, setResourceTitle] = useState(initialResource?.title ?? '');
  const [resourceDescription, setResourceDescription] = useState(initialResource?.description ?? '');
  const [resourceUrl, setResourceUrl] = useState(initialResource?.resourceUrl ?? '');
  const [resourceTagsInput, setResourceTagsInput] = useState((initialResource?.tags ?? []).join(', '));
  const [attachmentFileName, setAttachmentFileName] = useState<string | undefined>(initialResource?.attachmentFileName);
  const [attachmentFileType, setAttachmentFileType] = useState<'md' | 'pdf' | undefined>(initialResource?.attachmentFileType);
  const [attachmentMarkdownContent, setAttachmentMarkdownContent] = useState<string | undefined>(initialResource?.attachmentMarkdownContent);
  const [attachmentDataUrl, setAttachmentDataUrl] = useState<string | undefined>(initialResource?.attachmentDataUrl);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const parsedTags = useMemo(
    () => resourceTagsInput.split(',').map(tag => tag.trim()).filter(Boolean),
    [resourceTagsInput],
  );

  const handleSelectAttachmentFile = async (file: File | null) => {
    if (!file) return;
    const inferredFileType = inferAttachmentFileType(file.name);
    if (!inferredFileType) {
      setValidationMessage(LABELS.libraryUploadValidationFileType);
      return;
    }

    setValidationMessage(null);
    setIsUploadingFile(true);
    try {
      if (inferredFileType === 'md') {
        const markdownText = await readFileAsText(file);
        setAttachmentMarkdownContent(markdownText);
        setAttachmentDataUrl(undefined);
      } else {
        const pdfDataUrl = await readFileAsDataUrl(file);
        setAttachmentDataUrl(pdfDataUrl);
        setAttachmentMarkdownContent(undefined);
      }
      setAttachmentFileName(file.name);
      setAttachmentFileType(inferredFileType);
    } catch {
      setValidationMessage(LABELS.libraryUploadValidationFileReadFailed);
    } finally {
      setIsUploadingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 80px)', marginBottom: 80 }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-black text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-10 space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{LABELS.libraryUploadCategoryLabel}</label>
            <div className="grid grid-cols-3 gap-2">
              {RESOURCE_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="rounded-xl py-2 text-xs font-bold transition-all"
                  style={selectedCategory === category.id
                    ? { background: `linear-gradient(135deg, ${category.color}30, ${category.color}12)`, border: `1px solid ${category.color}55`, color: category.color }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {category.emoji} {category.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{LABELS.libraryUploadTitleLabel}</label>
            <input
              value={resourceTitle}
              onChange={event => setResourceTitle(event.target.value)}
              placeholder={LABELS.libraryUploadTitlePlaceholder}
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{LABELS.libraryUploadDescriptionLabel}</label>
            <textarea
              value={resourceDescription}
              onChange={event => setResourceDescription(event.target.value)}
              placeholder={LABELS.libraryUploadDescriptionPlaceholder}
              className="w-full min-h-28 px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{LABELS.libraryUploadUrlLabel}</label>
            <input
              value={resourceUrl}
              onChange={event => setResourceUrl(event.target.value)}
              placeholder={LABELS.libraryUploadUrlPlaceholder}
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{LABELS.libraryUploadTagsLabel}</label>
            <input
              value={resourceTagsInput}
              onChange={event => setResourceTagsInput(event.target.value)}
              placeholder={LABELS.libraryUploadTagsPlaceholder}
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{LABELS.libraryUploadAttachmentLabel}</label>
            <label className="w-full h-12 rounded-xl border border-dashed border-indigo-400/40 flex items-center justify-center gap-2 text-sm text-indigo-200 cursor-pointer">
              <Upload className="w-4 h-4" />
              {isUploadingFile ? LABELS.libraryUploadFileReading : LABELS.libraryUploadAttachmentButton}
              <input
                type="file"
                accept=".md,.pdf"
                className="hidden"
                onChange={event => {
                  void handleSelectAttachmentFile(event.target.files?.[0] ?? null);
                }}
              />
            </label>
            {attachmentFileName && (
              <p className="text-xs text-gray-400 mt-2">
                {LABELS.libraryUploadAttachedFilePrefix}: {attachmentFileName}
              </p>
            )}
          </div>

          {validationMessage && <p className="text-xs text-red-400">{validationMessage}</p>}

          <button
            onClick={() => {
              if (!resourceTitle.trim() || !resourceDescription.trim()) {
                setValidationMessage(LABELS.libraryUploadValidationRequired);
                return;
              }
              setValidationMessage(null);
              onSubmit({
                category: selectedCategory,
                title: resourceTitle.trim(),
                description: resourceDescription.trim(),
                resourceUrl: resourceUrl.trim() || undefined,
                tags: parsedTags,
                attachmentFileName,
                attachmentFileType,
                attachmentMarkdownContent,
                attachmentDataUrl,
              });
            }}
            disabled={isUploadingFile}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
