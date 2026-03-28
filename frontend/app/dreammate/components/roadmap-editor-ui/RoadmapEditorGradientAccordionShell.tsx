'use client';

import type { ReactNode } from 'react';

export type RoadmapEditorResultAccordionTone = 'sky' | 'emerald';

const tonePanelClass: Record<RoadmapEditorResultAccordionTone, string> = {
  sky:
    'rounded-2xl overflow-hidden bg-gradient-to-br from-sky-500/[0.09] via-indigo-500/[0.05] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]',
  emerald:
    'rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/[0.09] via-cyan-500/[0.05] to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]',
};

interface RoadmapEditorGradientAccordionShellProps {
  tone: RoadmapEditorResultAccordionTone;
  header: ReactNode;
  body?: ReactNode;
}

export function RoadmapEditorGradientAccordionShell({
  tone,
  header,
  body,
}: RoadmapEditorGradientAccordionShellProps) {
  return (
    <section className={tonePanelClass[tone]}>
      {header}
      {body}
    </section>
  );
}
