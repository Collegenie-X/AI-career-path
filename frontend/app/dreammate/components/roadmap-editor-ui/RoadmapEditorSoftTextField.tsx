'use client';

import type { ChangeEvent, TextareaHTMLAttributes } from 'react';
import {
  roadmapEditorSoftFieldClassName,
  roadmapEditorSoftFieldCompactClassName,
} from './roadmapEditorUiTokens';

interface RoadmapEditorSoftTextFieldSingleLineProps {
  variant?: 'default' | 'compact';
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  minHeightPx?: number;
}

export function RoadmapEditorSoftTextFieldSingleLine({
  variant = 'default',
  value,
  onChange,
  placeholder,
  className = '',
  minHeightPx,
}: RoadmapEditorSoftTextFieldSingleLineProps) {
  const base = variant === 'compact' ? roadmapEditorSoftFieldCompactClassName : roadmapEditorSoftFieldClassName;
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${base} px-4 py-3 text-base ${className}`}
      style={minHeightPx ? { minHeight: minHeightPx } : undefined}
    />
  );
}

interface RoadmapEditorSoftTextFieldMultilineProps
  extends Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  value: string;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  variant?: 'default' | 'compact';
  textSizeClassName?: string;
}

export function RoadmapEditorSoftTextFieldMultiline({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
  variant = 'default',
  textSizeClassName = 'text-sm',
}: RoadmapEditorSoftTextFieldMultilineProps) {
  const base = variant === 'compact' ? roadmapEditorSoftFieldCompactClassName : roadmapEditorSoftFieldClassName;
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`${base} px-4 py-3 resize-none ${textSizeClassName} ${className}`}
    />
  );
}
