'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EXPLORE_CAREER_LABELS } from '../config';

export function ExploreCareerLoadingState() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
      <p className="text-sm font-semibold text-white">{EXPLORE_CAREER_LABELS.loading_title}</p>
      <p className="text-xs text-muted-foreground max-w-xs">{EXPLORE_CAREER_LABELS.loading_sub}</p>
    </div>
  );
}

export function ExploreCareerErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-white">{EXPLORE_CAREER_LABELS.error_title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{EXPLORE_CAREER_LABELS.error_sub}</p>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
        {EXPLORE_CAREER_LABELS.retry}
      </Button>
    </div>
  );
}
