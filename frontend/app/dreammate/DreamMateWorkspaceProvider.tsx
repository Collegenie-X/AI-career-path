'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { SharedRoadmap } from './types';
import { useDreamMateWorkspace } from './hooks/useDreamMateWorkspace';
import seedRoadmapsData from '@/data/dreammate/seed/roadmaps.json';
import feedExecutionTemplatesData from '@/data/dreammate/seed/feedExecutionTemplates.json';
import seedResourcesData from '@/data/dreammate/seed/resources.json';
import seedSpacesData from '@/data/dreammate/seed/spaces.json';
import type { DreamResource, DreamSpace } from './types';

type DreamMateWorkspaceContextValue = ReturnType<typeof useDreamMateWorkspace>;

const DreamMateWorkspaceContext = createContext<DreamMateWorkspaceContextValue | null>(null);

export function DreamMateWorkspaceProvider({ children }: { children: ReactNode }) {
  /** 피드용 단계별 실행 템플릿(중2→고입→대입A/B→취업)을 먼저 노출 — 매 렌더 새 배열이면 하위 useEffect 무한 루프 유발 */
  const seedRoadmaps = useMemo(
    () => [
      ...(feedExecutionTemplatesData as SharedRoadmap[]),
      ...(seedRoadmapsData as SharedRoadmap[]),
    ],
    [],
  );
  const resources = seedResourcesData as DreamResource[];
  const seedSpaces = seedSpacesData as DreamSpace[];
  const workspace = useDreamMateWorkspace({ seedRoadmaps, seedSpaces, resources });

  return (
    <DreamMateWorkspaceContext.Provider value={workspace}>
      {children}
    </DreamMateWorkspaceContext.Provider>
  );
}

export function useDreamMateWorkspaceContext(): DreamMateWorkspaceContextValue {
  const ctx = useContext(DreamMateWorkspaceContext);
  if (!ctx) {
    throw new Error('useDreamMateWorkspaceContext must be used within DreamMateWorkspaceProvider');
  }
  return ctx;
}
