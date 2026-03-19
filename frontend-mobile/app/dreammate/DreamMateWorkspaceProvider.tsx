'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { SharedRoadmap } from './types';
import { useDreamMateWorkspace } from './hooks/useDreamMateWorkspace';
import seedRoadmapsData from '@/data/dreammate/seed/roadmaps.json';
import seedResourcesData from '@/data/dreammate/seed/resources.json';
import seedSpacesData from '@/data/dreammate/seed/spaces.json';
import type { DreamResource, DreamSpace } from './types';

type DreamMateWorkspaceContextValue = ReturnType<typeof useDreamMateWorkspace>;

const DreamMateWorkspaceContext = createContext<DreamMateWorkspaceContextValue | null>(null);

export function DreamMateWorkspaceProvider({ children }: { children: ReactNode }) {
  const seedRoadmaps = seedRoadmapsData as SharedRoadmap[];
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
