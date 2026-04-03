'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Users, ChevronRight, Crown, MessageSquare,
  X, UserPlus, Clock, Star, MoreVertical,
  LogOut, Copy,
  Search, Heart, TrendingUp, Pencil, Trash2,
} from 'lucide-react';
import { GRADE_YEARS, LABELS } from '../../config';
import { CAREER_GROUP_FORM_CONFIG } from '../../config/communityGroupForm';
import type { CommunityGroup, SharedPlan } from './types';
import { SharedPlanListSection } from './SharedPlanListSection';
import {
  filterSharedPlansForCommunityBrowse,
  type CommunityBrowseSortId,
} from './filterSharedPlansForCommunityBrowse';
import { formatTimeAgo, isRecentlyUpdated } from './formatTime';

/* ─── 더보기 메뉴 ─── */
function GroupMoreMenu({
  group,
  isJoined,
  onLeave,
  onCopyCode,
  onClose,
}: {
  group: CommunityGroup;
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
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${group.color}20` }}
            >
              {group.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{group.name}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {group.maxMembers != null
                  ? `${group.memberCount} / ${group.maxMembers}명`
                  : `${group.memberCount}명`} 참여 중
              </p>
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
            초대 코드 복사
          </button>

          {isJoined && (
            <button
              onClick={onLeave}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              그룹 탈퇴하기
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}

/* ─── 학교 공간과 동일: 공유 패스 필터·정렬 ─── */
const GROUP_SHARE_TYPE_FILTERS = [
  { id: 'all', label: '전체', emoji: '✨' },
  { id: 'public', label: '전체 공유', emoji: '🌐' },
  { id: 'operator', label: '운영자', emoji: '🛡️' },
] as const;

const GROUP_SORT_OPTIONS: { id: CommunityBrowseSortId; label: string; icon: typeof Heart }[] = [
  { id: 'recent', label: '최신', icon: TrendingUp },
  { id: 'likes', label: '좋아요', icon: Heart },
];

/* ─── 그룹 상세 뷰 (학교 공간 SchoolDetailView와 동일 UX 패턴) ─── */
export function GroupDetailView({
  group,
  sharedPlans,
  isJoined,
  onJoinClick,
  onLeave,
  onBack,
  onViewPlanDetail,
  likedPlanIds,
  bookmarkedPlanIds,
  likeCounts,
  bookmarkCounts,
  checkedPlans,
  onToggleLike,
  onToggleBookmark,
  isGroupOperator = false,
  onRequestEditGroup,
  onRequestDeleteGroup,
}: {
  group: CommunityGroup;
  sharedPlans: SharedPlan[];
  isJoined: boolean;
  onJoinClick?: () => void;
  onLeave: () => void;
  onBack: () => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  checkedPlans: Record<string, string>;
  onToggleLike: (planId: string) => void;
  onToggleBookmark: (planId: string) => void;
  /** 방장(생성자) — 수정·삭제 버튼 */
  isGroupOperator?: boolean;
  onRequestEditGroup?: () => void;
  onRequestDeleteGroup?: () => void;
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [shareTypeFilter, setShareTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<CommunityBrowseSortId>('recent');

  const inviteCode = group.inviteCode ?? group.id;

  const categoryMeta = group.category
    ? CAREER_GROUP_FORM_CONFIG.categories.find((c) => c.id === group.category)
    : undefined;
  const modeMeta = group.mode
    ? CAREER_GROUP_FORM_CONFIG.modes.find((m) => m.id === group.mode)
    : undefined;

  const filteredPlans = useMemo(
    () =>
      filterSharedPlansForCommunityBrowse(sharedPlans, {
        shareTypeFilter,
        searchQuery,
        sortBy,
        likeCounts,
      }),
    [sharedPlans, shareTypeFilter, searchQuery, sortBy, likeCounts],
  );

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(inviteCode);
    setShowMoreMenu(false);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyCodeInline = () => {
    navigator.clipboard?.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const updatedAt = group.updatedAt ?? group.createdAt;
  const breadcrumb = String(LABELS.community_group_detail_breadcrumb ?? '커뮤니티 · 그룹');
  const backListLabel = String(LABELS.community_group_list_back ?? '그룹 목록');
  const infoTitle = String(LABELS.community_group_info_section_title ?? '그룹 정보');
  const creatorBadge = String(LABELS.community_group_creator_badge ?? '방장');
  const inviteLabel = String(LABELS.community_group_invite_code_label ?? '초대 코드');
  const membersEmptyHint = String(
    LABELS.community_group_members_empty_hint ?? '아직 멤버가 없어요. 초대 코드로 친구를 불러보세요!',
  );
  const searchPlaceholder = String(
    LABELS.community_search_placeholder_shared_plans ?? '이름, 직업, 패스 검색…',
  );

  return (
    <div className="space-y-4">
      {/* Sticky header — SchoolDetailView와 동일 구조 */}
      <div
        className="sticky top-0 z-20 -mx-5 sm:-mx-6 md:-mx-7 px-5 sm:px-6 md:px-7 pt-3 pb-3"
        style={{
          backgroundColor: 'rgba(10,10,30,0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
        }}
      >
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => {
                onBack();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 h-10 pl-2.5 pr-2.5 sm:pl-3 sm:pr-3 rounded-xl text-sm font-black transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.92)',
              }}
              aria-label={backListLabel}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              {backListLabel}
            </button>

            <div className="min-w-0">
              <div className="text-[12px] font-bold tracking-wide text-gray-500">{breadcrumb}</div>
              <div className="text-sm font-black text-white truncate">{group.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {isGroupOperator && onRequestEditGroup && onRequestDeleteGroup && (
              <>
                <button
                  type="button"
                  onClick={onRequestEditGroup}
                  className="flex items-center gap-1 h-9 px-2 sm:px-2.5 rounded-xl text-[12px] sm:text-xs font-bold transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: `${group.color}24`,
                    border: `1px solid ${group.color}44`,
                    color: '#e9d5ff',
                  }}
                  title={String(LABELS.community_group_operator_edit ?? '수정')}
                >
                  <Pencil className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {String(LABELS.community_group_operator_edit ?? '수정')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onRequestDeleteGroup}
                  className="flex items-center gap-1 h-9 px-2 sm:px-2.5 rounded-xl text-[12px] sm:text-xs font-bold transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.35)',
                    color: '#FCA5A5',
                  }}
                  title={String(LABELS.community_group_operator_delete ?? '삭제')}
                >
                  <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {String(LABELS.community_group_operator_delete ?? '삭제')}
                  </span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowMoreMenu(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              aria-label="그룹 옵션 더보기"
            >
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 그룹 정보 카드 — 학교 정보 카드와 동일 톤 */}
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{
          background: `linear-gradient(135deg, ${group.color}15, rgba(168,85,247,0.08))`,
          border: `1px solid ${group.color}28`,
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${group.color}22`,
              border: `1px solid ${group.color}38`,
            }}
          >
            {group.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] font-black text-white/90">{infoTitle}</span>
              {isJoined && (
                <span
                  className="flex items-center gap-0.5 text-[12px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                >
                  <Star className="w-2 h-2" />
                  참여 중
                </span>
              )}
              {updatedAt && isRecentlyUpdated(updatedAt) && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                >
                  NEW
                </span>
              )}
            </div>
            <h3 className="text-base font-black text-white mt-1 leading-snug">{group.name}</h3>
            {group.description ? (
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{group.description}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[12px] text-gray-400">
              <span className="flex items-center gap-1 min-w-0">
                <Users className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">
                  {group.creatorName} · {creatorBadge}
                </span>
              </span>
              <span className="text-gray-600">·</span>
              <span className="flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5" />
                {group.memberCount}
                {group.maxMembers != null ? ` / ${group.maxMembers}` : ''}명
              </span>
              {updatedAt && (
                <>
                  <span className="text-gray-600">·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimeAgo(updatedAt)}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {categoryMeta && (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{
                    backgroundColor: `${categoryMeta.color}22`,
                    color: categoryMeta.color,
                    border: `1px solid ${categoryMeta.color}44`,
                  }}
                >
                  {categoryMeta.emoji} {categoryMeta.label}
                </span>
              )}
              {modeMeta && (
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {modeMeta.label}
                </span>
              )}
              {(group.tags ?? []).slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] text-gray-400 px-2 py-0.5 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopyCodeInline}
              className="mt-3 w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all active:scale-[0.99]"
              style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: `1px solid ${group.color}35`,
              }}
            >
              <span className="text-[11px] text-gray-500">{inviteLabel}</span>
              <span className="text-xs font-mono font-bold text-white/90 truncate">{inviteCode}</span>
              <Copy className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>

        {!isJoined && onJoinClick && (
          <button
            type="button"
            onClick={onJoinClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)`, color: '#fff' }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            참여하기
          </button>
        )}
      </div>

      {/* 멤버 — 카드형 (정보 보강) */}
      <div
        className="rounded-2xl p-4 sm:p-5"
        style={{
          backgroundColor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-gray-400">
            {String(LABELS.community_members ?? '멤버')} ({group.members.length})
          </span>
          <span className="text-[11px] text-gray-600">
            <MessageSquare className="w-3 h-3 inline mr-0.5 opacity-70" />
            {sharedPlans.length}개 패스
          </span>
        </div>
        {group.members.length === 0 ? (
          <p className="text-xs text-gray-500 leading-relaxed">{membersEmptyHint}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {group.members.map((member) => {
              const gradeInfo = GRADE_YEARS.find((g) => g.id === member.grade);
              const isCreator = member.id === group.creatorId;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${group.color}18` }}
                  >
                    {member.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate">{member.name}</span>
                      {isCreator && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#FBBF24' }} />}
                    </div>
                    <span className="text-[12px] text-gray-500">{gradeInfo?.label ?? member.grade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* 필터 + 정렬 — SchoolDetailView와 동일 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {GROUP_SHARE_TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setShareTypeFilter(f.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
              style={
                shareTypeFilter === f.id
                  ? {
                      backgroundColor: `${group.color}28`,
                      color: '#e9d5ff',
                      border: `1px solid ${group.color}45`,
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.35)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }
              }
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {GROUP_SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = sortBy === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSortBy(opt.id)}
                className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={
                  isActive
                    ? {
                        backgroundColor: `${group.color}22`,
                        color: '#e9d5ff',
                        border: `1px solid ${group.color}38`,
                      }
                    : { color: 'rgba(255,255,255,0.3)' }
                }
              >
                <Icon className="w-2.5 h-2.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 공유 패스 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-gray-400">
            {String(LABELS.community_shared_plans ?? '공유된 패스')} ({filteredPlans.length})
          </span>
        </div>
        <SharedPlanListSection
          plans={filteredPlans}
          emptyMessage="조건에 맞는 공유 패스가 없어요"
          likedPlanIds={likedPlanIds}
          bookmarkedPlanIds={bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={onToggleLike}
          onToggleBookmark={onToggleBookmark}
          onViewDetail={onViewPlanDetail}
        />
      </div>

      {showMoreMenu && (
        <GroupMoreMenu
          group={group}
          isJoined={isJoined}
          onLeave={() => {
            setShowMoreMenu(false);
            onLeave();
          }}
          onCopyCode={handleCopyCode}
          onClose={() => setShowMoreMenu(false)}
        />
      )}
      {codeCopied && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-xs font-bold text-white z-50"
          style={{ backgroundColor: 'rgba(34,197,94,0.9)' }}
        >
          {String(LABELS.community_invite_copy_success ?? '복사됨!')}
        </div>
      )}
    </div>
  );
}
