'use client';

import { useState, useEffect } from 'react';
import { COMMUNITY_SUB_TABS, type CommunitySubTab } from '../../config';
import type { LaunchpadSession } from '../../types';
import { SchoolClubView } from './SchoolClubView';
import { GroupListView } from './GroupListView';
import { CommunityAdminPanel } from './CommunityAdminPanel';

const STORAGE_KEY_ACCESS = 'launchpad_community_access';

function hasCommunityAccess(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ACCESS) === 'true';
  } catch {
    return false;
  }
}

type Props = {
  sessions: LaunchpadSession[];
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: (groupId?: string) => void;
};

export function CommunityTab({ sessions, onDetailSession, onCreateSession }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<CommunitySubTab>('school');
  const [hasAccess, setHasAccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHasAccess(hasCommunityAccess());
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {hasAccess && (
        <CommunityAdminPanel onApprove={() => setHasAccess(hasCommunityAccess())} />
      )}
      {/* 서브탭 */}
      <div className="flex gap-2">
        {COMMUNITY_SUB_TABS.map(tab => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
              style={isActive
                ? {
                    background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.4)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 서브탭 콘텐츠 */}
      {activeSubTab === 'school' ? (
        <SchoolClubView
          sessions={sessions}
          onDetailSession={onDetailSession}
          onCreateSession={onCreateSession}
        />
      ) : (
        <GroupListView
          sessions={sessions}
          onDetailSession={onDetailSession}
          onCreateSession={onCreateSession}
        />
      )}
    </div>
  );
}
