'use client';

import { useState, useEffect, useMemo } from 'react';
import { Rocket, Plus, Zap, BookOpen, ChevronRight, Flame, Target, Video, School, GraduationCap } from 'lucide-react';
import { TabBar } from '@/components/tab-bar';
import { SessionCard } from './components/SessionCard';
import { SessionDetail } from './components/SessionDetail';
import { SessionForm } from './components/SessionForm';
import { QuickCreator } from './components/QuickCreator';
import { SESSION_TYPES } from './config';
import type { LaunchpadSession } from './types';
import seedData from '@/data/launchpad.json';

const STORAGE_KEY = 'launchpad_sessions';
const JOINED_KEY  = 'launchpad_joined';
const OWNER_KEY   = 'launchpad_owned';

function loadSessions(): LaunchpadSession[] {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch {}
  return seedData as LaunchpadSession[];
}
function saveSessions(s: LaunchpadSession[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function loadSet(k: string): Set<string> {
  try { const r = localStorage.getItem(k); if (r) return new Set(JSON.parse(r)); } catch {}
  return new Set();
}
function saveSet(k: string, s: Set<string>) { localStorage.setItem(k, JSON.stringify([...s])); }

/* ─── 별 배경 ─── */
function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i, x: ((i * 163.7) % 100), y: ((i * 91.1) % 100),
      size: (i % 3) + 1, delay: (i * 0.45) % 4, dur: 2 + (i % 3),
    })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: 0.15,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }} />
      ))}
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

/* ─── 타입 선택 탭 ─── */
type TypeTabKey = 'all' | 'seminar' | 'career_workshop' | 'project_group';
const TYPE_TABS: { key: TypeTabKey; label: string; emoji: string; color: string }[] = [
  { key: 'all',             label: '전체',     emoji: '🚀', color: '#6C5CE7' },
  { key: 'seminar',         label: '세미나',   emoji: '📖', color: '#3B82F6' },
  { key: 'career_workshop', label: '워크숍',   emoji: '🗺️', color: '#6C5CE7' },
  { key: 'project_group',   label: '프로젝트', emoji: '⚡', color: '#FBBF24' },
];

function TypeTabs({ active, onChange, counts }: {
  active: TypeTabKey;
  onChange: (k: TypeTabKey) => void;
  counts: Record<TypeTabKey, number>;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {TYPE_TABS.map(t => {
        const isActive = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            className="relative flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl transition-all active:scale-95"
            style={isActive
              ? { background: `linear-gradient(145deg, ${t.color}30, ${t.color}18)`, border: `1.5px solid ${t.color}70`, boxShadow: `0 0 12px ${t.color}30` }
              : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: t.color, boxShadow: `0 0 6px ${t.color}` }} />
            )}
            <span className="text-base mb-0.5">{t.emoji}</span>
            <span className="text-[10px] font-bold" style={{ color: isActive ? t.color : 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </span>
            {counts[t.key] > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
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

/* ─── 모드 필터 탭 (온라인/동아리) ─── */
type ModeFilterKey = 'all' | 'online' | 'offline' | 'teacher';
const MODE_FILTER_TABS: { key: ModeFilterKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all',     label: '전체',     icon: Target,         color: '#6C5CE7' },
  { key: 'online',  label: 'Zoom',     icon: Video,          color: '#3B82F6' },
  { key: 'offline', label: '동아리',   icon: School,         color: '#22C55E' },
  { key: 'teacher', label: '진로교사', icon: GraduationCap,  color: '#FBBF24' },
];

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

/* ─── 내 현황 탭 ─── */
type MyTabKey = 'all' | 'joined' | 'owned';
const MY_TABS: { key: MyTabKey; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'all',    label: '전체 탐색',   icon: Target,  color: '#6C5CE7' },
  { key: 'joined', label: '참여 중',     icon: Flame,   color: '#22C55E' },
  { key: 'owned',  label: '내 런치패드', icon: Rocket,  color: '#FBBF24' },
];

function MyTabs({ active, onChange, counts }: {
  active: MyTabKey;
  onChange: (k: MyTabKey) => void;
  counts: Record<MyTabKey, number>;
}) {
  return (
    <div className="flex gap-2">
      {MY_TABS.map(t => {
        const isActive = active === t.key;
        const Icon = t.icon;
        return (
          <button key={t.key} onClick={() => onChange(t.key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl transition-all active:scale-95"
            style={isActive
              ? { background: `linear-gradient(135deg, ${t.color}28, ${t.color}14)`, border: `1.5px solid ${t.color}60`, boxShadow: `0 2px 12px ${t.color}20` }
              : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
            <Icon className="w-3.5 h-3.5" style={{ color: isActive ? t.color : 'rgba(255,255,255,0.35)' }} />
            <div className="text-left">
              <div className="text-[10px] font-bold leading-none" style={{ color: isActive ? t.color : 'rgba(255,255,255,0.4)' }}>
                {t.label}
              </div>
              <div className="text-[9px] mt-0.5" style={{ color: isActive ? `${t.color}99` : 'rgba(255,255,255,0.2)' }}>
                {counts[t.key]}개
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Hero 배너 ─── */
function HeroBanner({ onQuick, onFull }: { onQuick: () => void; onFull: () => void }) {
  return (
    <div
      className="mx-4 mt-4 rounded-3xl p-5 relative overflow-hidden"
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
            🚀 LAUNCHPAD
          </div>
          <div className="px-2 py-0.5 rounded-full text-[10px] font-black"
            style={{ backgroundColor: 'rgba(59,130,246,0.25)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
            🔵 Zoom 중심
          </div>
        </div>
        <h2 className="text-[20px] font-black text-white leading-tight mb-1">
          커리어를 함께
          <span className="ml-1.5 bg-gradient-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
            실행하는 공간
          </span>
        </h2>
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Zoom 세미나 · 워크숍 · 학교 동아리 모임을 직접 열거나 참여해보세요
        </p>

        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {[
            { emoji: '📖', label: '세미나', sub: 'Zoom 강연', color: '#3B82F6' },
            { emoji: '🗺️', label: '워크숍', sub: 'Zoom 실습', color: '#6C5CE7' },
            { emoji: '🏫', label: '동아리', sub: '학교 내', color: '#22C55E' },
          ].map(it => (
            <div key={it.label} className="flex-1 rounded-xl py-2 px-1.5 text-center"
              style={{ backgroundColor: `${it.color}15`, border: `1px solid ${it.color}28` }}>
              <div className="text-lg mb-0.5">{it.emoji}</div>
              <div className="text-[9px] font-bold leading-tight" style={{ color: it.color }}>{it.label}</div>
              <div className="text-[8px] text-gray-600">{it.sub}</div>
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
          {filtered ? '해당 조건의 런치패드가 없어요' : '아직 런치패드가 없어요'}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {filtered ? '다른 카테고리를 선택해보세요' : '첫 번째 모임을 직접 열어보세요!'}
        </p>
      </div>
      {!filtered && (
        <button
          className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
          onClick={onOpen}
        >
          <Plus className="w-4 h-4" />런치패드 열기
        </button>
      )}
    </div>
  );
}

/* ─── 메인 페이지 ─── */
export default function LaunchpadPage() {
  const [mounted, setMounted]           = useState(false);
  const [sessions, setSessions]         = useState<LaunchpadSession[]>([]);
  const [joined, setJoined]             = useState<Set<string>>(new Set());
  const [owned, setOwned]               = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter]     = useState<TypeTabKey>('all');
  const [modeFilter, setModeFilter]     = useState<ModeFilterKey>('online');
  const [myTab, setMyTab]               = useState<MyTabKey>('all');
  const [showForm, setShowForm]         = useState(false);
  const [showQuick, setShowQuick]       = useState(false);
  const [editTarget, setEditTarget]     = useState<LaunchpadSession | null>(null);
  const [detailSession, setDetail]      = useState<LaunchpadSession | null>(null);

  useEffect(() => {
    setMounted(true);
    setSessions(loadSessions());
    setJoined(loadSet(JOINED_KEY));
    setOwned(loadSet(OWNER_KEY));
  }, []);

  if (!mounted) return null;

  /* ── CRUD ── */
  const handleJoin = (id: string) => {
    setSessions(prev => { const n = prev.map(s => s.id === id ? { ...s, currentParticipants: s.currentParticipants + 1 } : s); saveSessions(n); return n; });
    setJoined(prev => { const n = new Set(prev).add(id); saveSet(JOINED_KEY, n); return n; });
  };
  const handleCancel = (id: string) => {
    setSessions(prev => { const n = prev.map(s => s.id === id ? { ...s, currentParticipants: Math.max(0, s.currentParticipants - 1) } : s); saveSessions(n); return n; });
    setJoined(prev => { const n = new Set(prev); n.delete(id); saveSet(JOINED_KEY, n); return n; });
  };
  const handleCreate = (data: Omit<LaunchpadSession, 'id' | 'createdAt' | 'currentParticipants'>) => {
    const s: LaunchpadSession = { ...data, id: `lp-${Date.now()}`, currentParticipants: 0, createdAt: new Date().toISOString() };
    setSessions(prev => { const n = [s, ...prev]; saveSessions(n); return n; });
    setOwned(prev => { const n = new Set(prev).add(s.id); saveSet(OWNER_KEY, n); return n; });
    setShowForm(false);
    setShowQuick(false);
  };
  const handleUpdate = (data: Omit<LaunchpadSession, 'id' | 'createdAt' | 'currentParticipants'>) => {
    if (!editTarget) return;
    setSessions(prev => { const n = prev.map(s => s.id === editTarget.id ? { ...s, ...data } : s); saveSessions(n); return n; });
    setEditTarget(null);
  };
  const handleDelete = (id: string) => {
    setSessions(prev => { const n = prev.filter(s => s.id !== id); saveSessions(n); return n; });
    setOwned(prev => { const n = new Set(prev); n.delete(id); saveSet(OWNER_KEY, n); return n; });
    setDetail(null);
  };

  /* ── 필터링 ── */
  const filtered = sessions.filter(s => {
    const typeOk  = typeFilter === 'all' || s.type === typeFilter;
    const modeOk  = modeFilter === 'all'
      ? true
      : modeFilter === 'online'  ? s.mode === 'online'
      : modeFilter === 'offline' ? s.mode === 'offline'
      : s.isTeacherCreated === true;
    const myOk    = myTab === 'all' ? true : myTab === 'joined' ? joined.has(s.id) : owned.has(s.id);
    return typeOk && modeOk && myOk;
  });

  const joinedCount = sessions.filter(s => joined.has(s.id)).length;
  const ownedCount  = sessions.filter(s => owned.has(s.id)).length;

  const typeCounts: Record<TypeTabKey, number> = {
    all:             sessions.length,
    seminar:         sessions.filter(s => s.type === 'seminar').length,
    career_workshop: sessions.filter(s => s.type === 'career_workshop').length,
    project_group:   sessions.filter(s => s.type === 'project_group').length,
  };
  const modeCounts: Record<ModeFilterKey, number> = {
    all:     sessions.length,
    online:  sessions.filter(s => s.mode === 'online').length,
    offline: sessions.filter(s => s.mode === 'offline').length,
    teacher: sessions.filter(s => s.isTeacherCreated).length,
  };
  const myCounts: Record<MyTabKey, number> = {
    all:    sessions.length,
    joined: joinedCount,
    owned:  ownedCount,
  };

  const isFiltered = typeFilter !== 'all' || modeFilter !== 'all' || myTab !== 'all';

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      <StarField />

      {/* ── 헤더 ── */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 px-4 py-3"
        style={{ backgroundColor: 'rgba(26,26,46,0.92)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}>
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">런치패드</h1>
              <p className="text-[10px] text-gray-500 leading-none">Zoom · 학교 동아리 모임</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className="h-8 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', color: '#1a1a2e' }}
              onClick={() => setShowQuick(true)}
            >
              <Zap className="w-3 h-3" />
              빠른
            </button>
            <button
              className="h-8 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff', boxShadow: '0 2px 12px rgba(108,92,231,0.4)' }}
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-3 h-3" />
              열기
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10">

        {/* ── Hero ── */}
        <HeroBanner onQuick={() => setShowQuick(true)} onFull={() => setShowForm(true)} />

        {/* ── 내 현황 탭 ── */}
        <div className="px-4 mt-5">
          <SectionHeader label="내 현황" sub="참여 중인 모임과 내가 만든 모임" accent="#22C55E" />
          <MyTabs active={myTab} onChange={setMyTab} counts={myCounts} />
        </div>

        {/* ── 모드 필터 (온라인/동아리/진로교사) ── */}
        <div className="px-4 mt-3">
          <SectionHeader label="모임 방식" sub="Zoom 온라인 우선 활성화" accent="#3B82F6" />
          <ModeFilterTabs active={modeFilter} onChange={setModeFilter} counts={modeCounts} />
        </div>

        {/* ── 타입 필터 ── */}
        <div className="px-4 mt-3">
          <TypeTabs active={typeFilter} onChange={setTypeFilter} counts={typeCounts} />
        </div>

        {/* ── 목록 ── */}
        <div className="px-4 mt-3">
          {filtered.length === 0 ? (
            <EmptyState onOpen={() => setShowForm(true)} filtered={isFiltered} />
          ) : (
            <div className="space-y-3 pb-4">
              {filtered.map(session => (
                <SessionCard
                  key={session.id}
                  session={session}
                  isJoined={joined.has(session.id)}
                  isOwner={owned.has(session.id)}
                  onJoin={handleJoin}
                  onCancel={handleCancel}
                  onDetail={setDetail}
                  onEdit={setEditTarget}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {detailSession && (
        <SessionDetail
          session={detailSession}
          isJoined={joined.has(detailSession.id)}
          isOwner={owned.has(detailSession.id)}
          onJoin={handleJoin}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onEdit={setEditTarget}
          onClose={() => setDetail(null)}
        />
      )}
      {showQuick && (
        <QuickCreator
          onSubmit={handleCreate}
          onClose={() => setShowQuick(false)}
          onOpenFullForm={() => { setShowQuick(false); setShowForm(true); }}
        />
      )}
      {showForm && <SessionForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editTarget && <SessionForm initial={editTarget} onSubmit={handleUpdate} onClose={() => setEditTarget(null)} />}

      <TabBar />
    </div>
  );
}
