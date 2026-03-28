'use client';

import type { ReactNode } from 'react';
import { roadmapEditorSectionLabelClassName } from './roadmapEditorUiTokens';

interface RoadmapEditorLabeledFieldRowProps {
  label: string;
  trailing?: ReactNode;
  children: ReactNode;
}

export function RoadmapEditorLabeledFieldRow({
  label,
  trailing,
  children,
}: RoadmapEditorLabeledFieldRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={roadmapEditorSectionLabelClassName}>{label}</span>
        {trailing}
      </div>
      {children}
    </div>
  );
}
