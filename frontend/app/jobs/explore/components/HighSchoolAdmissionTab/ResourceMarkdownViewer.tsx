'use client';

import { DreamLibraryMarkdownViewer } from '@/app/dreammate/components/DreamLibraryMarkdownViewer';

export function ResourceMarkdownViewer({ markdownText }: { markdownText: string }) {
  return <DreamLibraryMarkdownViewer markdownContent={markdownText} />;
}
