'use client';

import { useState } from 'react';
import { Flame, Rocket, Plus } from 'lucide-react';
import { MY_SUB_TABS, LAUNCHPAD_LABELS, type MySubTab } from '../config';
import type { LaunchpadSession } from '../types';
import { SessionCard } from './SessionCard';

type Props = {
  sessions: LaunchpadSession[];
  joined: Set<string>;
  owned: Set<string>;
  onJoin: (id: string) => void;
  onCancel: (id: string) => void;
  onDetail: (session: LaunchpadSession) => void;
  onEdit: (session: LaunchpadSession) => void;
  onOpenForm: () => void;
};

export function MyLaunchpadTab({
  sessions,
  joined,
  owned,
  onJoin,
  onCancel,
  onDetail,
  onEdit,
  onOpenForm,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<MySubTab>('joined');

  const joinedSessions = sessions.filter(s => joined.has(s.id));
  const ownedSessions  = sessions.filter(s => owned.has(s.id));
  const displayedSessions = activeSubTab === 'joined' ? joinedSessions : ownedSessions;

  return (
    <div className="space-y-4">
      {/* 서브탭 */}
      <div className="flex gap-2">
        {MY_SUB_TABS.map(tab => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          const count = tab.id === 'joined' ? joinedSessions.length : ownedSessions.length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95"
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
              <Icon className="w-4 h-4" />
              <span className="text-xs font-bold">{tab.label}</span>
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={isActive
                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                  : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 통계 요약 */}
      <div
        className="grid grid-cols-2 gap-3 p-4 rounded-2xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <StatCard label="참여 중" count={joinedSessions.length} icon={Flame} color="#22C55E" />
        <StatCard label="내가 만든 것" count={ownedSessions.length} icon={Rocket} color="#FBBF24" />
      </div>

      {/* 세션 목록 */}
      {displayedSessions.length === 0 ? (
        <EmptyMyState
          isJoinedTab={activeSubTab === 'joined'}
          onOpenForm={onOpenForm}
        />
      ) : (
        <div className="space-y-3 pb-4">
          {displayedSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              isJoined={joined.has(session.id)}
              isOwner={owned.has(session.id)}
              onJoin={onJoin}
              onCancel={onCancel}
              onDetail={onDetail}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── 통계 카드 ─── */
function StatCard({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}15)` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-lg font-black text-white">{count}</div>
        <div className="text-[10px] text-gray-500">{label}</div>
      </div>
    </div>
  );
}

/* ─── 빈 상태 ─── */
function EmptyMyState({
  isJoinedTab,
  onOpenForm,
}: {
  isJoinedTab: boolean;
  onOpenForm: () => void;
}) {
  return (
    <div className="py-10 flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
        style={{ backgroundColor: 'rgba(108,92,231,0.12)', border: '1px dashed rgba(108,92,231,0.3)' }}
      >
        {isJoinedTab ? '🔍' : '🚀'}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-300">
          {isJoinedTab ? '아직 참여 중인 런치패드가 없어요' : '아직 만든 런치패드가 없어요'}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {isJoinedTab ? '탐색 탭에서 관심 있는 모임에 참여해보세요' : '첫 번째 모임을 직접 열어보세요!'}
        </p>
      </div>
      {!isJoinedTab && (
        <button
          className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
          onClick={onOpenForm}
        >
          <Plus className="w-4 h-4" />런치패드 열기
        </button>
      )}
    </div>
  );
}
