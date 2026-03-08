'use client';

import { useState } from 'react';
import { Plus, X, Video, School, Shuffle } from 'lucide-react';
import { LAUNCHPAD_LABELS, GROUP_CATEGORIES } from '../../config';
import type { LaunchpadGroup } from '../../types';

const MODE_ICONS = {
  online: Video,
  offline: School,
  hybrid: Shuffle,
} as const;

const MODE_LABELS_SHORT = {
  online: '온라인',
  offline: '오프라인',
  hybrid: '온·오프',
} as const;

type Props = {
  onSubmit: (group: LaunchpadGroup) => void;
  onClose: () => void;
};

export function CreateGroupDialog({ onSubmit, onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LaunchpadGroup['category']>('study');
  const [mode, setMode] = useState<LaunchpadGroup['mode']>('online');
  const [maxMembers, setMaxMembers] = useState(15);
  const [tags, setTags] = useState('');
  const [creatorName, setCreatorName] = useState('');

  const canSubmit = name.trim() && description.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    const cat = GROUP_CATEGORIES[category];
    onSubmit({
      id: `grp-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      mode,
      emoji: cat.emoji,
      color: cat.color,
      creatorName: creatorName.trim() || '익명',
      memberCount: 1,
      maxMembers,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublic: true,
      sessionIds: [],
      createdAt: new Date().toISOString(),
    });
  };

  const inp: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl flex flex-col"
        style={{
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: 'none',
          maxHeight: 'calc(100dvh - 60px)',
          animation: 'sheet-slide-up 0.32s cubic-bezier(0.32,0.72,0,1) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/25" />
        </div>

        <div className="px-5 pt-1 pb-3 flex items-center justify-between flex-shrink-0 border-b border-white/10">
          <div>
            <div className="text-base font-bold text-white">{LAUNCHPAD_LABELS.groupCreateButton}</div>
            <div className="text-xs text-gray-500">함께할 사람들을 모아보세요</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">그룹 이름 *</label>
            <input style={inp} placeholder="그룹 이름을 입력하세요" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">설명 *</label>
            <input style={inp} placeholder="어떤 그룹인지 소개해주세요" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">카테고리</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(GROUP_CATEGORIES) as [LaunchpadGroup['category'], typeof GROUP_CATEGORIES[LaunchpadGroup['category']]][]).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key)}
                  className="flex flex-col items-center py-2 rounded-xl text-center transition-all active:scale-95"
                  style={category === key
                    ? { backgroundColor: `${cat.color}20`, border: `1.5px solid ${cat.color}60`, color: cat.color }
                    : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
                >
                  <span className="text-base mb-0.5">{cat.emoji}</span>
                  <span className="text-[9px] font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">진행 방식</label>
            <div className="grid grid-cols-3 gap-2">
              {(['online', 'offline', 'hybrid'] as const).map(m => {
                const MIcon = MODE_ICONS[m];
                const isActive = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="flex flex-col items-center py-2 rounded-xl transition-all active:scale-95"
                    style={isActive
                      ? { backgroundColor: 'rgba(108,92,231,0.2)', border: '1.5px solid rgba(108,92,231,0.6)', color: '#6C5CE7' }
                      : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
                  >
                    <MIcon className="w-3.5 h-3.5 mb-0.5" />
                    <span className="text-[10px] font-bold">{MODE_LABELS_SHORT[m]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">최대 인원: <span className="text-white font-bold">{maxMembers}명</span></label>
            <input type="range" min={3} max={50} value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))} className="w-full accent-purple-500" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">만든 사람</label>
            <input style={inp} placeholder="이름 또는 닉네임 (미입력 시 익명)" value={creatorName} onChange={e => setCreatorName(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">태그 (쉼표로 구분)</label>
            <input style={inp} placeholder="예: AI, 스터디, 프로젝트" value={tags} onChange={e => setTags(e.target.value)} />
          </div>

          <div className="pt-2 pb-10">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={canSubmit
                ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff', boxShadow: '0 4px 24px rgba(108,92,231,0.45)' }
                : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }}
            >
              <Plus className="w-4 h-4" />
              그룹 만들기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
