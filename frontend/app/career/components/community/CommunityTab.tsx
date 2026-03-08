'use client';

import { useState, useEffect, useCallback } from 'react';
import { School as SchoolIcon, Users, X, Plus } from 'lucide-react';
import communityData from '@/data/share-community.json';
import type { SharedPlan, CommunityGroup, School, OperatorComment, UserReactionState } from './types';
import { SchoolSpaceView } from './SchoolSpaceView';
import { GroupListView } from './GroupListView';
import { SharedPlanDetailDialog } from './SharedPlanDetailDialog';

type SubTab = 'school' | 'groups';

const SUB_TABS: { id: SubTab; label: string; icon: typeof SchoolIcon }[] = [
  { id: 'school', label: '학교 공간', icon: SchoolIcon },
  { id: 'groups', label: '그룹',     icon: Users },
];

const REACTIONS_STORAGE_KEY = 'community_reactions_v1';
const CHECKED_PLANS_STORAGE_KEY = 'community_checked_plans_v1';

/* ─── Join school dialog ─── */
function JoinSchoolDialog({ onClose, onJoin }: {
  onClose: () => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[380px] rounded-3xl p-6 space-y-4"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white">학교 참여하기</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          진로 선생님이 알려준 학교 코드를 입력하세요.<br />
          같은 학교 친구들의 공유된 커리어 패스를 볼 수 있어요.
        </p>
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="학교 코드 입력 (예: FUTURE2024)"
          className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none tracking-widest font-mono"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
        <button
          onClick={() => { if (code.trim()) onJoin(code.trim()); }}
          disabled={!code.trim()}
          className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
        >
          참여하기
        </button>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export function CommunityTab({ onNewPlan }: { onNewPlan: () => void }) {
  const [subTab, setSubTab] = useState<SubTab>('school');
  const [showJoinSchool, setShowJoinSchool] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null);

  const [joinedSchool, setJoinedSchool] = useState<School | null>(
    communityData.schools[0] as School,
  );

  const sharedPlans = communityData.sharedPlans as SharedPlan[];
  const groups = communityData.groups as CommunityGroup[];

  /* ─── Reactions state ─── */
  const [reactions, setReactions] = useState<UserReactionState>({
    likedPlanIds: [],
    bookmarkedPlanIds: [],
  });

  /* likeCounts / bookmarkCounts: base value from JSON, adjusted by saved reactions */
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    sharedPlans.forEach(p => { counts[p.id] = p.likes; });
    return counts;
  });
  const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    sharedPlans.forEach(p => { counts[p.id] = p.bookmarks; });
    return counts;
  });

  /* 확인 필요 뱃지: 조회 시 사라짐 (localStorage) */
  const [checkedPlans, setCheckedPlans] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(CHECKED_PLANS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  /* 상세 조회 시 해당 패스를 '확인함'으로 기록 */
  const handleViewPlanDetail = useCallback((plan: SharedPlan | null) => {
    setSelectedPlan(plan);
    if (plan) {
      const checkedAt = new Date().toISOString();
      setCheckedPlans(prev => {
        const next = { ...prev, [plan.id]: checkedAt };
        localStorage.setItem(CHECKED_PLANS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, []);

  /* Load persisted reactions + checked plans once on mount */
  useEffect(() => {
    try {
      const rawChecked = localStorage.getItem(CHECKED_PLANS_STORAGE_KEY);
      if (rawChecked) {
        setCheckedPlans(JSON.parse(rawChecked) as Record<string, string>);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REACTIONS_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as UserReactionState;
      setReactions(saved);

      /* Adjust counts: base + 1 if user has reacted */
      setLikeCounts(() => {
        const counts: Record<string, number> = {};
        sharedPlans.forEach(p => {
          counts[p.id] = p.likes + (saved.likedPlanIds.includes(p.id) ? 1 : 0);
        });
        return counts;
      });
      setBookmarkCounts(() => {
        const counts: Record<string, number> = {};
        sharedPlans.forEach(p => {
          counts[p.id] = p.bookmarks + (saved.bookmarkedPlanIds.includes(p.id) ? 1 : 0);
        });
        return counts;
      });
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Toggle like — uses functional updater to avoid stale closure */
  const handleToggleLike = useCallback((planId: string) => {
    setReactions(prev => {
      const wasLiked = prev.likedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...prev,
        likedPlanIds: wasLiked
          ? prev.likedPlanIds.filter(id => id !== planId)
          : [...prev.likedPlanIds, planId],
      };
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(updated));

      /* Sync count immediately */
      const base = (communityData.sharedPlans as SharedPlan[]).find(p => p.id === planId)?.likes ?? 0;
      setLikeCounts(prevCounts => ({ ...prevCounts, [planId]: base + (wasLiked ? 0 : 1) }));

      return updated;
    });
  }, []);

  /* Toggle bookmark — same pattern */
  const handleToggleBookmark = useCallback((planId: string) => {
    setReactions(prev => {
      const wasBookmarked = prev.bookmarkedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...prev,
        bookmarkedPlanIds: wasBookmarked
          ? prev.bookmarkedPlanIds.filter(id => id !== planId)
          : [...prev.bookmarkedPlanIds, planId],
      };
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(updated));

      const base = (communityData.sharedPlans as SharedPlan[]).find(p => p.id === planId)?.bookmarks ?? 0;
      setBookmarkCounts(prevCounts => ({ ...prevCounts, [planId]: base + (wasBookmarked ? 0 : 1) }));

      return updated;
    });
  }, []);

  const schoolPlans = joinedSchool
    ? sharedPlans.filter(p => p.schoolId === joinedSchool.id)
    : [];

  const handleJoinSchool = (code: string) => {
    const found = communityData.schools.find(s => s.code === code) as School | undefined;
    if (found) {
      setJoinedSchool(found);
      setShowJoinSchool(false);
    }
  };

  const handleAddComment = (_planId: string, _comment: OperatorComment) => {
    // 추후 백엔드 연동 시 API 호출
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Sub-tab switcher */}
      <div
        className="flex gap-2 p-1 rounded-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {SUB_TABS.map(tab => {
          const isActive = subTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all"
              style={isActive
                ? { background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff', boxShadow: '0 2px 12px rgba(108,92,231,0.3)' }
                : { color: 'rgba(255,255,255,0.4)' }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {subTab === 'school' ? (
        <SchoolSpaceView
          school={joinedSchool}
          sharedPlans={schoolPlans}
          likedPlanIds={reactions.likedPlanIds}
          bookmarkedPlanIds={reactions.bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
          onViewPlanDetail={handleViewPlanDetail}
          onJoinSchool={() => setShowJoinSchool(true)}
        />
      ) : (
        <GroupListView
          groups={groups}
          sharedPlans={sharedPlans}
          likedPlanIds={reactions.likedPlanIds}
          bookmarkedPlanIds={reactions.bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
          onViewPlanDetail={handleViewPlanDetail}
        />
      )}

      {/* 커리어 패스 만들기 fixed button */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-5 max-w-[430px] mx-auto">
        <button
          onClick={onNewPlan}
          className="w-full h-14 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
            boxShadow: '0 8px 28px rgba(108,92,231,0.55)',
          }}
        >
          <Plus className="w-5 h-5" />
          커리어 패스 만들기
        </button>
      </div>

      {/* Dialogs */}
      {showJoinSchool && (
        <JoinSchoolDialog
          onClose={() => setShowJoinSchool(false)}
          onJoin={handleJoinSchool}
        />
      )}

      {selectedPlan && (
        <SharedPlanDetailDialog
          plan={selectedPlan}
          isLiked={reactions.likedPlanIds.includes(selectedPlan.id)}
          isBookmarked={reactions.bookmarkedPlanIds.includes(selectedPlan.id)}
          likeCount={likeCounts[selectedPlan.id] ?? selectedPlan.likes}
          bookmarkCount={bookmarkCounts[selectedPlan.id] ?? selectedPlan.bookmarks}
          onToggleLike={() => handleToggleLike(selectedPlan.id)}
          onToggleBookmark={() => handleToggleBookmark(selectedPlan.id)}
          onClose={() => setSelectedPlan(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
