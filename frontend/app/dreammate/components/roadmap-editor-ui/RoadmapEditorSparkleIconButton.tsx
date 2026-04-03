'use client';

import { Sparkles } from 'lucide-react';
import { roadmapEditorSparkleButtonClassName } from './roadmapEditorUiTokens';

interface RoadmapEditorSparkleIconButtonProps {
  title: string;
  ariaLabel: string;
  onClick: () => void;
}

export function RoadmapEditorSparkleIconButton({
  title,
  ariaLabel,
  onClick,
}: RoadmapEditorSparkleIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      className={roadmapEditorSparkleButtonClassName}
    >
      <Sparkles className="w-3.5 h-3.5" />
    </button>
  );
}
