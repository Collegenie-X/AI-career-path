'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface RoadmapEditorAccordionHeaderButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  trailing?: ReactNode;
  titleClassName: string;
  subtitleClassName: string;
  chevronClassName: string;
}

export function RoadmapEditorAccordionHeaderButton({
  isOpen,
  onToggle,
  icon,
  title,
  subtitle,
  trailing,
  titleClassName,
  subtitleClassName,
  chevronClassName,
}: RoadmapEditorAccordionHeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2.5 text-left gap-2"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-base flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className={`text-sm font-bold truncate ${titleClassName}`}>{title}</p>
          <p className={`text-sm mt-0.5 line-clamp-2 ${subtitleClassName}`}>{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {trailing}
        {isOpen ? (
          <ChevronUp className={`w-4 h-4 ${chevronClassName}`} />
        ) : (
          <ChevronDown className={`w-4 h-4 ${chevronClassName}`} />
        )}
      </div>
    </button>
  );
}
