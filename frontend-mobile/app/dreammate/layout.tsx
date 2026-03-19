'use client';

import { DreamMateWorkspaceProvider } from './DreamMateWorkspaceProvider';

export default function DreamMateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DreamMateWorkspaceProvider>
      {children}
    </DreamMateWorkspaceProvider>
  );
}
