'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  School as SchoolIcon, Users, Search, ChevronRight,
  Heart, TrendingUp, Clock, Crown, Star,
  MoreVertical, LogOut, Copy, X,
} from 'lucide-react';
import type { SharedPlan, School } from './types';
import communityData from '@/data/share-community.json';
import { SharedPlanCardWithReactions } from './SharedPlanCardWithReactions';
import { JoinRequestDialog } from './JoinRequestDialog';
import { formatTimeAgo } from './formatTime';
import { leaveSchool } from '@/lib/careerCommunity';

/* ─── 학교 카드 ─── */
function SchoolCard({
  school,
  badge,
  onSelect,
}: {
  school: School;
  badge?: 'joined' | 'operator';
  onSelect: () => void;
}) {
  const badgeStyle =
    badge === 'operator'
      ? { bg: 'rgba(251,191,36,0.15)', color: '#FBBF24', label: '운영 중', icon: <Crown className="w-2.5 h-2.5" /> }
      : badge === 'joined'
      ? { bg: 'rgba(34,197,94,0.15)', color: '#22C55E', label: '참여 중', icon: <Star className="w-2.5 h-2.5" /> }
      : null;

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
      style={{
        backgroundColor: badge ? 'rgba(108,92,231,0.08)' : 'rgba(255,255,255,0.03)',
        border: badge ? '1px solid rgba(108,92,231,0.25)' : '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.2)' }}
        >
          🏫
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white truncate">{school.name}</span>
            {badgeStyle && (
              <span
                className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}
              >
                {badgeStyle.icon}
                {badgeStyle.label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span>{school.operatorEmoji} {school.operatorName} 선생님</span>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Users className="w-2.5 h-2.5" />{school.memberCount}명
            </span>
            {(school.updatedAt ?? school.createdAt) && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {formatTimeAgo(school.updatedAt ?? school.createdAt)}
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
      </div>
    </button>
  );
}

/* ─── 학교 더보기 메뉴 ─── */
function SchoolMoreMenu({
  school,
  isJoined,
  onLeave,
  onCopyCode,
  onClose,
}: {
  school: School;
  isJoined: boolean;
  onLeave: () => void;
  onCopyCode: () => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const menuContent = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: 'rgba(108,92,231,0.2)' }}>
              🏫
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{school.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{school.operatorEmoji} {school.operatorName} 선생님</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 py-3 flex flex-col gap-1">
          <button
            onClick={onCopyCode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <Copy className="w-4 h-4 text-gray-400 flex-shrink-0" />
            학교 코드 복사
          </button>
          {isJoined && (
            <button
              onClick={onLeave}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              학교 탈퇴하기
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}

/* ─── 학교 상세 뷰 ─── */
type SortOption = 'recent' | 'likes';

const SORT_OPTIONS: { id: SortOption; label: string; icon: typeof Heart }[] = [
  { id: 'recent', label: '최신',   icon: TrendingUp },
  { id: 'likes',  label: '좋아요', icon: Heart },
];

const SHARE_TYPE_FILTERS = [
  { id: 'all',      label: '전체',      emoji: '✨' },
  { id: 'public',   label: '전체 공유', emoji: '🌐' },
  { id: 'operator', label: '운영자',    emoji: '🛡️' },
];

function SchoolDetailView({
  school,
  sharedPlans,
  isJoined,
  onJoinClick,
  onLeave,
  onBack,
  likedPlanIds,
  bookmarkedPlanIds,
  likeCounts,
  bookmarkCounts,
  checkedPlans,
  onToggleLike,
  onToggleBookmark,
  onViewPlanDetail,
}: {
  school: School;
  sharedPlans: SharedPlan[];
  isJoined: boolean;
  onJoinClick?: () => void;
  onLeave: () => void;
  onBack: () => void;
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  checkedPlans: Record<string, string>;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
}) {
  const [shareTypeFilter, setShareTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const filteredPlans = useMemo(() => {
    let result = sharedPlans.filter(p => p.schoolId === school.id);
    if (shareTypeFilter !== 'all') result = result.filter(p => p.shareType === shareTypeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.jobName.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'likes') result = [...result].sort((a, b) => (likeCounts[b.id] ?? b.likes) - (likeCounts[a.id] ?? a.likes));
    else result = [...result].sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());
    return result;
  }, [sharedPlans, school.id, shareTypeFilter, searchQuery, sortBy, likeCounts]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(school.code);
    setCodeCopied(true);
    setShowMoreMenu(false);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Sticky header: 뒤로 + 현재 컨텍스트 + 더보기 */}
      <div
        className="sticky top-0 z-20 -mx-4 px-4 pt-3 pb-3"
        style={{
          backgroundColor: 'rgba(10,10,30,0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2.5">
            <button
              onClick={() => {
                onBack();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 h-10 pl-3 pr-3 rounded-xl text-sm font-black transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.92)',
              }}
              aria-label="학교 목록으로 돌아가기"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              학교 목록
            </button>

            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-wide text-gray-500">
                커뮤니티 · 학교 공간
              </div>
              <div className="text-sm font-black text-white truncate">
                {school.name}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowMoreMenu(true)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
            aria-label="학교 옵션 더보기"
          >
            <MoreVertical className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* 학교 헤더 */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(168,85,247,0.08))',
          border: '1px solid rgba(108,92,231,0.25)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.3)' }}
          >
            🏫
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-white/90">학교 정보</span>
              {isJoined && (
                <span
                  className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                >
                  <Star className="w-2 h-2" />참여 중
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] text-gray-400">
              <span>{school.operatorEmoji} {school.operatorName} 선생님</span>
              <span className="text-gray-600">·</span>
              <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{school.memberCount}명</span>
            </div>
          </div>
        </div>

        {/* 미가입: 참여하기 버튼 (가입 시 탈퇴는 더보기 메뉴에서) */}
        {!isJoined && onJoinClick && (
          <button
            onClick={onJoinClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
          >
            <SchoolIcon className="w-3.5 h-3.5" />
            참여하기
          </button>
        )}
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="이름, 직업, 패스 검색..."
          className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* 필터 + 정렬 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {SHARE_TYPE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setShareTypeFilter(f.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={shareTypeFilter === f.id
                ? { backgroundColor: 'rgba(108,92,231,0.2)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.35)' }
                : { backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const isActive = sortBy === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                style={isActive
                  ? { backgroundColor: 'rgba(108,92,231,0.15)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.3)' }
                  : { color: 'rgba(255,255,255,0.3)' }}
              >
                <Icon className="w-2.5 h-2.5" />{opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 패스 목록 */}
      <div className="text-xs text-gray-500">{filteredPlans.length}개</div>
      {filteredPlans.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-500">조건에 맞는 공유 패스가 없어요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPlans.map(plan => (
            <SharedPlanCardWithReactions
              key={plan.id}
              plan={plan}
              isLiked={likedPlanIds.includes(plan.id)}
              isBookmarked={bookmarkedPlanIds.includes(plan.id)}
              likeCount={likeCounts[plan.id] ?? plan.likes}
              bookmarkCount={bookmarkCounts[plan.id] ?? plan.bookmarks}
              checkedAt={checkedPlans[plan.id]}
              onToggleLike={() => onToggleLike(plan.id)}
              onToggleBookmark={() => onToggleBookmark(plan.id)}
              onViewDetail={() => onViewPlanDetail(plan)}
            />
          ))}
        </div>
      )}

      {/* 더보기 메뉴 */}
      {showMoreMenu && (
        <SchoolMoreMenu
          school={school}
          isJoined={isJoined}
          onLeave={() => { setShowMoreMenu(false); onLeave(); }}
          onCopyCode={handleCopyCode}
          onClose={() => setShowMoreMenu(false)}
        />
      )}
      {codeCopied && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold text-white z-50"
          style={{ backgroundColor: 'rgba(34,197,94,0.9)' }}
        >
          코드 복사됨!
        </div>
      )}
    </div>
  );
}

/* ─── 메인 export ─── */
type Props = {
  joinedSchoolIds: string[];
  sharedPlans: SharedPlan[];
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  checkedPlans: Record<string, string>;
  onToggleLike: (planId: string) => void;
  onToggleBookmark: (planId: string) => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
  onJoinSchool: (schoolId: string) => void;
  onLeaveSchool: (schoolId: string) => void;
  onRefreshJoined: () => void;
};

export function SchoolSpaceView({
  joinedSchoolIds,
  sharedPlans,
  likedPlanIds,
  bookmarkedPlanIds,
  likeCounts,
  bookmarkCounts,
  checkedPlans,
  onToggleLike,
  onToggleBookmark,
  onViewPlanDetail,
  onJoinSchool,
  onLeaveSchool,
  onRefreshJoined,
}: Props) {
  const allSchools = communityData.schools as School[];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [joinTargetSchool, setJoinTargetSchool] = useState<School | null>(null);
  const [showJoinByCodeDialog, setShowJoinByCodeDialog] = useState(false);

  const selectedSchool = selectedSchoolId
    ? allSchools.find(s => s.id === selectedSchoolId) ?? null
    : null;

  const operatorSchoolId = 'school-1';

  const sortedSchools = useMemo(() => {
    const filtered = searchQuery.trim()
      ? allSchools.filter(s => s.name.includes(searchQuery.trim()))
      : allSchools;
    return [...filtered].sort((a, b) => {
      const rankA = a.id === operatorSchoolId ? 0 : joinedSchoolIds.includes(a.id) ? 1 : 2;
      const rankB = b.id === operatorSchoolId ? 0 : joinedSchoolIds.includes(b.id) ? 1 : 2;
      return rankA - rankB;
    });
  }, [allSchools, joinedSchoolIds, searchQuery]);

  /* 학교 카드 클릭: 가입 여부에 따라 분기 */
  const handleSchoolCardClick = (school: School) => {
    if (joinedSchoolIds.includes(school.id)) {
      setSelectedSchoolId(school.id);
    } else {
      setJoinTargetSchool(school);
    }
  };

  const handleJoinSuccess = (school: School) => {
    onJoinSchool(school.id);
    onRefreshJoined();
    setJoinTargetSchool(null);
    setShowJoinByCodeDialog(false);
    setSelectedSchoolId(school.id);
  };

  const handleLeave = (schoolId: string) => {
    leaveSchool(schoolId);
    onLeaveSchool(schoolId);
    onRefreshJoined();
    setSelectedSchoolId(null);
  };

  /* 학교 상세 뷰 */
  if (selectedSchool) {
    const schoolPlans = sharedPlans.filter(p => p.schoolId === selectedSchool.id);
    const isJoined = joinedSchoolIds.includes(selectedSchool.id);
    return (
      <>
        <SchoolDetailView
          school={selectedSchool}
          sharedPlans={schoolPlans}
          isJoined={isJoined}
          onJoinClick={!isJoined ? () => setJoinTargetSchool(selectedSchool) : undefined}
          onLeave={() => handleLeave(selectedSchool.id)}
          onBack={() => setSelectedSchoolId(null)}
          likedPlanIds={likedPlanIds}
          bookmarkedPlanIds={bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={onToggleLike}
          onToggleBookmark={onToggleBookmark}
          onViewPlanDetail={onViewPlanDetail}
        />
        {joinTargetSchool && (
          <JoinRequestDialog
            target="school"
            targetName={joinTargetSchool.name}
            validCode={joinTargetSchool.code}
            onClose={() => setJoinTargetSchool(null)}
            onJoin={() => handleJoinSuccess(joinTargetSchool)}
          />
        )}
      </>
    );
  }

  /* 학교 목록 뷰 */
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="학교명으로 검색..."
          className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {sortedSchools.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-500">검색 결과가 없어요</p>
        </div>
      ) : (
        sortedSchools.map(school => {
          const badge =
            school.id === operatorSchoolId ? 'operator'
            : joinedSchoolIds.includes(school.id) ? 'joined'
            : undefined;
          return (
            <SchoolCard
              key={school.id}
              school={school}
              badge={badge}
              onSelect={() => handleSchoolCardClick(school)}
            />
          );
        })
      )}

      {/* 코드로 참여하기 */}
      <button
        onClick={() => setShowJoinByCodeDialog(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.5)',
          border: '1px dashed rgba(255,255,255,0.12)',
        }}
      >
        <SchoolIcon className="w-3.5 h-3.5" />
        학교 코드로 참여하기
      </button>

      {/* 미가입 학교 클릭 → JoinRequestDialog */}
      {joinTargetSchool && (
        <JoinRequestDialog
          target="school"
          targetName={joinTargetSchool.name}
          validCode={joinTargetSchool.code}
          onClose={() => setJoinTargetSchool(null)}
          onJoin={() => handleJoinSuccess(joinTargetSchool)}
        />
      )}

      {/* 코드 직접 입력 */}
      {showJoinByCodeDialog && (
        <JoinSchoolByCodeDialog
          schools={allSchools}
          onClose={() => setShowJoinByCodeDialog(false)}
          onJoinSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
}

/* ─── 코드로 학교 찾기 다이얼로그 ─── */
function JoinSchoolByCodeDialog({
  schools,
  onClose,
  onJoinSuccess,
}: {
  schools: School[];
  onClose: () => void;
  onJoinSuccess: (school: School) => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    const entered = code.trim().toUpperCase();
    if (!entered) { setError('코드를 입력해주세요'); return; }
    const school = schools.find(s => s.code.toUpperCase() === entered);
    if (school) {
      onJoinSuccess(school);
    } else {
      setError('유효하지 않은 코드예요');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl p-5"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-black text-white mb-1">학교 코드로 참여</h3>
        <p className="text-xs text-gray-400 mb-4">진로 선생님이 알려준 학교 코드를 입력하세요.</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => { setCode(e.target.value); setError(null); }}
            placeholder="예: FUTURE2024"
            className="flex-1 h-12 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none tracking-widest font-mono"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!code.trim()}
            className="px-5 h-12 rounded-xl text-sm font-bold disabled:opacity-40 transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
          >
            참여
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}
