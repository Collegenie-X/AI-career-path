'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LABELS } from '../config';

interface ActionButtonProps {
  isLast: boolean;
  color: string;
  colorLight: string;
  onClick: () => void;
}

export function ActionButton({
  isLast,
  color,
  colorLight,
  onClick,
}: ActionButtonProps) {
  return (
    <Button
      size="lg"
      className="w-full h-14 text-base font-bold rounded-2xl border-0 relative overflow-hidden transition-transform active:scale-[0.97]"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${colorLight} 100%)`,
        boxShadow: `0 8px 24px ${color}40`,
      }}
      onClick={onClick}
    >
      <span className="absolute inset-0 animate-shimmer" />
      <span className="relative flex items-center justify-center gap-2">
        {isLast ? (
          <>
            {LABELS.btn_start}
            <Sparkles className="w-5 h-5" />
          </>
        ) : (
          <>
            {LABELS.btn_next}
            <ChevronRight className="w-5 h-5" />
          </>
        )}
      </span>
    </Button>
  );
}
