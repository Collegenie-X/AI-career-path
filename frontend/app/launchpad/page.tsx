'use client';

import { useState, useEffect, useMemo } from 'react';
import { Rocket, Plus, Zap } from 'lucide-react';
import { TabBar } from '@/components/tab-bar';
import { SessionDetail } from './components/SessionDetail';
import { SessionForm } from './components/SessionForm';
import { QuickCreator } from './components/QuickCreator';
import { ExploreTab, type TypeTabKey, type ModeFilterKey } from './components/ExploreTab';
import { MyLaunchpadTab } from './components/MyLaunchpadTab';
import { CommunityTab } from './components/community';
import { LAUNCHPAD_TABS, type LaunchpadTabId } from './config';
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

/* ─── 메인 페이지 ─── */
export default function LaunchpadPage() {
  const [mounted, setMounted]           = useState(false);
  const [sessions, setSessions]         = useState<LaunchpadSession[]>([]);
  const [joined, setJoined]             = useState<Set<string>>(new Set());
  const [owned, setOwned]               = useState<Set<string>>(new Set());

  const [activeTab, setActiveTab]       = useState<LaunchpadTabId>('explore');
  const [typeFilter, setTypeFilter]     = useState<TypeTabKey>('all');
  const [modeFilter, setModeFilter]     = useState<ModeFilterKey>('online');

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

  return (
    <div className="min-h-screen pb-28 relative overflow-hidden">
      <StarField />

      {/* ── 헤더 ── */}
      <div
        className="sticky top-0 z-20 px-4"
        style={{
          backgroundColor: 'rgba(26,26,46,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}>
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">런치패드</h1>
              <p className="text-[10px] text-gray-500 leading-none">Zoom · 학교 동아리 · 그룹 모임</p>
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

        {/* ── 상위 탭바 ── */}
        <div className="flex gap-1.5 pb-3">
          {LAUNCHPAD_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
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
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="relative z-10 px-4 pt-4">
        {activeTab === 'explore' ? (
          <ExploreTab
            sessions={sessions}
            joined={joined}
            owned={owned}
            typeFilter={typeFilter}
            modeFilter={modeFilter}
            onTypeFilterChange={setTypeFilter}
            onModeFilterChange={setModeFilter}
            onJoin={handleJoin}
            onCancel={handleCancel}
            onDetail={setDetail}
            onEdit={setEditTarget}
            onOpenForm={() => setShowForm(true)}
            onOpenQuick={() => setShowQuick(true)}
          />
        ) : activeTab === 'community' ? (
          <CommunityTab
            sessions={sessions}
            onDetailSession={setDetail}
            onCreateSession={() => setShowForm(true)}
          />
        ) : activeTab === 'my' ? (
          <MyLaunchpadTab
            sessions={sessions}
            joined={joined}
            owned={owned}
            onJoin={handleJoin}
            onCancel={handleCancel}
            onDetail={setDetail}
            onEdit={setEditTarget}
            onOpenForm={() => setShowForm(true)}
          />
        ) : null}
      </div>

      {/* ── 모달들 ── */}
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
