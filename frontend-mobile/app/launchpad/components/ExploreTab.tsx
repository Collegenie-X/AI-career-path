'use client';

import { useMemo } from 'react';
import { Plus, Zap, ChevronRight, Target, Video, School, GraduationCap, Search, Map, Trophy } from 'lucide-react';
import { SESSION_TYPES, LAUNCHPAD_LABELS } from '../config';
import type { LaunchpadSession } from '../types';
import { SessionCard } from './SessionCard';

/* ─── 탐색 전용: 목적 기반 타입 탭 ─── */
type TypeTabKey = 'all' | 'career_explore' | 'career_design' | 'challenge' | 'certification';

const TYPE_TABS: { key: TypeTabKey; label: string; emoji: string; color: string }[] = [
  { key: 'all',            label: '전체',       emoji: '🚀', color: '#6C5CE7' },
  { key: 'career_explore', label: '진로 탐색',  emoji: '🔍', color: '#3B82F6' },
  { key: 'career_design',  label: '커리어 설계', emoji: '🗺️', color: '#6C5CE7' },
  { key: 'challenge',      label: '실행·도전',  emoji: '⚡', color: '#FBBF24' },
  { key: 'certification',  label: '자격·수상',  emoji: '🏆', color: '#22C55E' },
];

/* ─── 모드 필터 탭 ─── */
type ModeFilterKey = 'all' | 'online' | 'offline' | 'teacher';

const MODE_FILTER_TABS: { key: ModeFilterKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all',     label: '전체',     icon: Target,         color: '#6C5CE7' },
  { key: 'online',  label: 'Zoom',     icon: Video,          color: '#3B82F6' },
  { key: 'offline', label: '오프라인', icon: School,         color: '#22C55E' },
  { key: 'teacher', label: '진로교사', icon: GraduationCap,  color: '#FBBF24' },
];

type Props = {
  sessions: LaunchpadSession[];
  joined: Set<string>;
  owned: Set<string>;
  typeFilter: TypeTabKey;
  modeFilter: ModeFilterKey;
  onTypeFilterChange: (key: TypeTabKey) => void;
  onModeFilterChange: (key: ModeFilterKey) => void;
  onJoin: (id: string) => void;
  onCancel: (id: string) => void;
  onDetail: (session: LaunchpadSession) => void;
  onEdit: (session: LaunchpadSession) => void;
  onOpenForm: () => void;
  onOpenQuick: () => void;
};

export type { TypeTabKey, ModeFilterKey };

export function ExploreTab({
  sessions,
  joined,
  owned,
  typeFilter,
  modeFilter,
  onTypeFilterChange,
  onModeFilterChange,
  onJoin,
  onCancel,
  onDetail,
  onEdit,
  onOpenForm,
  onOpenQuick,
}: Props) {
  const independentSessions = useMemo(
    () => sessions.filter(s => !s.groupId),
    [sessions],
  );

  const filtered = useMemo(() =>
    independentSessions.filter(s => {
      const typeOk = typeFilter === 'all' || s.type === typeFilter;
      const modeOk = modeFilter === 'all'
        ? true
        : modeFilter === 'online'  ? s.mode === 'online'
        : modeFilter === 'offline' ? (s.mode === 'offline' || s.mode === 'hybrid')
        : s.isTeacherCreated === true;
      return typeOk && modeOk;
    }),
    [independentSessions, typeFilter, modeFilter],
  );

  const typeCounts: Record<TypeTabKey, number> = useMemo(() => ({
    all:            independentSessions.length,
    career_explore: independentSessions.filter(s => s.type === 'career_explore').length,
    career_design:  independentSessions.filter(s => s.type === 'career_design').length,
    challenge:      independentSessions.filter(s => s.type === 'challenge').length,
    certification:  independentSessions.filter(s => s.type === 'certification').length,
  }), [independentSessions]);

  const modeCounts: Record<ModeFilterKey, number> = useMemo(() => ({
    all:     independentSessions.length,
    online:  independentSessions.filter(s => s.mode === 'online').length,
    offline: independentSessions.filter(s => s.mode === 'offline' || s.mode === 'hybrid').length,
    teacher: independentSessions.filter(s => s.isTeacherCreated).length,
  }), [independentSessions]);

  const isFiltered = typeFilter !== 'all' || modeFilter !== 'all';

  return (
    <div className="space-y-4">
      <HeroBanner onQuick={onOpenQuick} onFull={onOpenForm} />

      <div>
        <SectionHeader label="모임 방식" sub="Zoom 온라인 우선 활성화" accent="#3B82F6" />
        <ModeFilterTabs active={modeFilter} onChange={onModeFilterChange} counts={modeCounts} />
      </div>

      <TypeTabs active={typeFilter} onChange={onTypeFilterChange} counts={typeCounts} />

      {filtered.length === 0 ? (
        <EmptyState onOpen={onOpenForm} filtered={isFiltered} />
      ) : (
        <div className="space-y-3 pb-4">
          {filtered.map(session => (
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

/* ─── 섹션 헤더 ─── */
function SectionHeader({ label, sub, accent }: { label: string; sub?: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: accent ?? '#6C5CE7' }} />
      <div>
        <div className="text-sm font-bold text-white">{label}</div>
        {sub && <div className="text-[10px] text-gray-500">{sub}</div>}
      </div>
    </div>
  );
}

/* ─── 타입 탭 (5개 → grid-cols-5) ─── */
function TypeTabs({ active, onChange, counts }: {
  active: TypeTabKey;
  onChange: (k: TypeTabKey) => void;
  counts: Record<TypeTabKey, number>;
}) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {TYPE_TABS.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            className="relative flex flex-col items-center justify-center py-2.5 px-0.5 rounded-2xl transition-all active:scale-95"
            style={isActive
              ? { background: `linear-gradient(145deg, ${t.color}30, ${t.color}18)`, border: `1.5px solid ${t.color}70`, boxShadow: `0 0 12px ${t.color}30` }
              : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: t.color, boxShadow: `0 0 6px ${t.color}` }} />
            )}
            <span className="text-base mb-0.5">{t.emoji}</span>
            <span className="text-[9px] font-bold leading-tight text-center" style={{ color: isActive ? t.color : 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </span>
            {counts[t.key] > 0 && (
              <span className="absolute -top-1 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                style={{ backgroundColor: isActive ? t.color : 'rgba(255,255,255,0.15)', color: isActive ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                {counts[t.key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─── 모드 필터 탭 ─── */
function ModeFilterTabs({ active, onChange, counts }: {
  active: ModeFilterKey;
  onChange: (k: ModeFilterKey) => void;
  counts: Record<ModeFilterKey, number>;
}) {
  return (
    <div className="flex gap-1.5">
      {MODE_FILTER_TABS.map(t => {
        const isActive = active === t.key;
        const Icon = t.icon;
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            className="flex-1 flex flex-col items-center justify-center py-2 rounded-2xl transition-all active:scale-95"
            style={isActive
              ? { background: `linear-gradient(135deg, ${t.color}28, ${t.color}14)`, border: `1.5px solid ${t.color}60`, boxShadow: `0 2px 12px ${t.color}20` }
              : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
            <Icon className="w-3.5 h-3.5 mb-0.5" style={{ color: isActive ? t.color : 'rgba(255,255,255,0.3)' }} />
            <div className="text-[9px] font-bold" style={{ color: isActive ? t.color : 'rgba(255,255,255,0.35)' }}>
              {t.label}
            </div>
            <div className="text-[9px] mt-0.5" style={{ color: isActive ? `${t.color}99` : 'rgba(255,255,255,0.2)' }}>
              {counts[t.key]}
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Hero 배너 ─── */
function HeroBanner({ onQuick, onFull }: { onQuick: () => void; onFull: () => void }) {
  const HERO_ITEMS = [
    { emoji: '🔍', label: '진로 탐색',  sub: '직업 알아보기', color: '#3B82F6' },
    { emoji: '🗺️', label: '커리어 설계', sub: '로드맵 작성',  color: '#6C5CE7' },
    { emoji: '⚡', label: '실행·도전',  sub: '공모전·프로젝트', color: '#FBBF24' },
    { emoji: '🏆', label: '자격·수상',  sub: '자격증·포트폴리오', color: '#22C55E' },
  ];

  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.28) 0%, rgba(59,130,246,0.18) 60%, rgba(251,191,36,0.08) 100%)',
        border: '1px solid rgba(108,92,231,0.35)',
        boxShadow: '0 8px 32px rgba(108,92,231,0.15)',
      }}
    >
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6C5CE7, transparent)' }} />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase"
            style={{ backgroundColor: 'rgba(108,92,231,0.3)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.4)' }}>
            🔍 탐색
          </div>
          <div className="px-2 py-0.5 rounded-full text-[10px] font-black"
            style={{ backgroundColor: 'rgba(59,130,246,0.25)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
            개별 모임 참여
          </div>
        </div>
        <h2 className="text-[20px] font-black text-white leading-tight mb-1">
          {LAUNCHPAD_LABELS.exploreHeroTitle}
          <span className="ml-1.5 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            {LAUNCHPAD_LABELS.exploreHeroHighlight}
          </span>
        </h2>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          {LAUNCHPAD_LABELS.exploreHeroDesc}
        </p>

        <div className="grid grid-cols-4 gap-1 mb-4">
          {HERO_ITEMS.map(it => (
            <div key={it.label} className="flex-1 rounded-xl py-2 px-1 text-center"
              style={{ backgroundColor: `${it.color}15`, border: `1px solid ${it.color}28` }}>
              <div className="text-lg mb-0.5">{it.emoji}</div>
              <div className="text-[8px] font-bold leading-tight" style={{ color: it.color }}>{it.label}</div>
              <div className="text-[7px] text-gray-600 leading-tight mt-0.5">{it.sub}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 h-10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', color: '#1a1a2e', boxShadow: '0 4px 16px rgba(251,191,36,0.35)' }}
            onClick={onQuick}
          >
            <Zap className="w-3.5 h-3.5" />
            빠른 생성
          </button>
          <button
            className="flex-1 h-10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff', boxShadow: '0 4px 16px rgba(108,92,231,0.4)' }}
            onClick={onFull}
          >
            <Plus className="w-3.5 h-3.5" />
            직접 만들기
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── 빈 상태 ─── */
function EmptyState({ onOpen, filtered }: { onOpen: () => void; filtered: boolean }) {
  return (
    <div className="py-10 flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
        style={{ backgroundColor: 'rgba(108,92,231,0.12)', border: '1px dashed rgba(108,92,231,0.3)' }}>
        {filtered ? '🔍' : '🚀'}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-300">
          {filtered ? '해당 조건의 모임이 없어요' : LAUNCHPAD_LABELS.emptyTitle}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {filtered ? '다른 카테고리를 선택해보세요' : LAUNCHPAD_LABELS.emptyDesc}
        </p>
      </div>
      {!filtered && (
        <button
          className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
          onClick={onOpen}
        >
          <Plus className="w-4 h-4" />모임 열기
        </button>
      )}
    </div>
  );
}
