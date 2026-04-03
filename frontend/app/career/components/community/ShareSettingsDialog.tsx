'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Globe, School, Users, Lock, Check, ChevronLeft, AlertTriangle,
} from 'lucide-react';
import type { ShareChannel, CommunityGroup } from './types';
import { channelsToShareType } from './types';

/* ─── Config ─── */

const MAX_DESCRIPTION_LENGTH = 100;

type Step = 'description' | 'scope';

type ChannelOption = {
  id: ShareChannel;
  label: string;
  description: string;
  icon: typeof Globe;
  color: string;
};

const CHANNEL_OPTIONS: ChannelOption[] = [
  {
    id: 'public',
    label: '전체 공유',
    description: '탐색 탭에서 모든 사람이 볼 수 있어요',
    icon: Globe,
    color: '#22C55E',
  },
  {
    id: 'school',
    label: '학교 공유',
    description: '내가 가입된 학교 전체에 공유돼요',
    icon: School,
    color: '#3B82F6',
  },
  {
    id: 'group',
    label: '그룹 공유',
    description: '내가 참여한 그룹을 선택해 공유해요',
    icon: Users,
    color: '#A855F7',
  },
];

/* ─── Types ─── */

type Props = {
  planTitle: string;
  currentDescription?: string;
  currentChannels?: ShareChannel[];
  currentGroupIds?: string[];
  availableGroups: CommunityGroup[];
  isCurrentlyShared?: boolean;
  onConfirm: (channels: ShareChannel[], description: string, groupIds: string[]) => void;
  onClose: () => void;
};

/* ─── Component ─── */

export function ShareSettingsDialog({
  planTitle,
  currentDescription = '',
  currentChannels = [],
  currentGroupIds = [],
  availableGroups,
  isCurrentlyShared = false,
  onConfirm,
  onClose,
}: Props) {
  const [step, setStep] = useState<Step>('description');
  const [description, setDescription] = useState(currentDescription);
  const [selectedChannels, setSelectedChannels] = useState<ShareChannel[]>(currentChannels);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(currentGroupIds);
  const [isPrivate, setIsPrivate] = useState(currentChannels.length === 0 && isCurrentlyShared);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrivateToggle = () => {
    setIsPrivate(true);
    setSelectedChannels([]);
    setSelectedGroupIds([]);
  };

  const handleChannelToggle = (channel: ShareChannel) => {
    setIsPrivate(false);
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel],
    );
    if (channel !== 'group') return;
    // 그룹 채널 해제 시 선택된 그룹도 초기화
    if (selectedChannels.includes('group')) {
      setSelectedGroupIds([]);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId],
    );
  };

  const isGroupSelected = selectedChannels.includes('group');

  const canConfirm =
    isPrivate ||
    (selectedChannels.length > 0 &&
      (!isGroupSelected || selectedGroupIds.length > 0));

  const confirmLabel = (() => {
    if (isPrivate) return '비공개로 저장';
    if (selectedChannels.length === 0) return '공유 범위를 선택하세요';
    const labels = selectedChannels.map(c => {
      if (c === 'public') return '전체';
      if (c === 'school') return '학교';
      return `그룹 ${selectedGroupIds.length}개`;
    });
    return `${labels.join(' · ')} 공유하기`;
  })();

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (isPrivate) {
      onConfirm([], description.trim(), []);
    } else {
      const groupIds = isGroupSelected ? selectedGroupIds : [];
      onConfirm(selectedChannels, description.trim(), groupIds);
    }
  };

  const stepTitle: Record<Step, string> = {
    description: '간단 설명',
    scope: '공유 범위',
  };

  const stepSubtitle: Record<Step, string> = {
    description: '이 패스를 한 줄로 소개해보세요 (선택)',
    scope: '공유할 채널을 선택하세요 (복수 선택 가능)',
  };

  const sheet = (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center pointer-events-auto"
      data-layer="share-settings-overlay"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto animate-slide-up flex flex-col"
        style={{
          backgroundColor: '#12122a',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 'calc(100vh - 80px)',
          marginBottom: 80,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {step === 'scope' && (
              <button
                onClick={() => setStep('description')}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <div>
              <h3 className="text-lg font-black text-white">{stepTitle[step]}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{stepSubtitle[step]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Plan title chip */}
        <div className="mx-5 mb-4 px-3 py-2 rounded-xl flex items-center gap-2"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-xs text-gray-500">패스</span>
          <span className="text-xs font-semibold text-white line-clamp-1 flex-1">{planTitle}</span>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Step content */}
        <div className="px-5 pb-3 flex-1">
          {step === 'description' && (
            <DescriptionStep description={description} onChange={setDescription} />
          )}
          {step === 'scope' && (
            <ScopeStep
              selectedChannels={selectedChannels}
              isPrivate={isPrivate}
              availableGroups={availableGroups}
              selectedGroupIds={selectedGroupIds}
              onPrivateToggle={handlePrivateToggle}
              onChannelToggle={handleChannelToggle}
              onGroupToggle={handleGroupToggle}
            />
          )}
        </div>

        {/* Actions */}
        <div className="px-5 pb-8 pt-3 space-y-2">
          {step === 'description' && (
            <button
              onClick={() => setStep('scope')}
              className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
            >
              다음 — 공유 범위 선택
            </button>
          )}

          {step === 'scope' && (
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
            >
              {confirmLabel}
            </button>
          )}

          {isCurrentlyShared && step === 'scope' && !isPrivate && (
            <button
              onClick={() => onConfirm([], description.trim(), [])}
              className="w-full h-10 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              공유 해제 (비공개로 전환)
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(sheet, document.body);
}

/* ─── Step indicator ─── */

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ['description', 'scope'];
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center gap-1.5 px-5 mb-4">
      {steps.map((s, idx) => {
        const isActive = idx === currentIdx;
        const isDone = idx < currentIdx;
        return (
          <div
            key={s}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              flex: isActive ? 2 : 1,
              backgroundColor: isDone ? '#6C5CE7' : isActive ? '#a855f7' : 'rgba(255,255,255,0.1)',
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Step 1: Description ─── */

function DescriptionStep({
  description,
  onChange,
}: {
  description: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={description}
          onChange={e => onChange(e.target.value.slice(0, MAX_DESCRIPTION_LENGTH))}
          placeholder="이 패스를 한 줄로 소개해보세요 (예: 의대 진학을 목표로 중2부터 준비한 탐구형 로드맵)"
          rows={3}
          className="w-full resize-none rounded-2xl px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all"
          style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1.5px solid rgba(255,255,255,0.1)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        />
        <span className="absolute bottom-3 right-4 text-[11px] text-gray-600">
          {description.length}/{MAX_DESCRIPTION_LENGTH}
        </span>
      </div>
      <p className="text-[11px] text-gray-600 leading-relaxed">
        설명은 커뮤니티에서 다른 사람들이 패스를 이해하는 데 도움이 돼요. 건너뛰어도 괜찮아요.
      </p>
    </div>
  );
}

/* ─── Step 2: Scope (멀티 선택 + 비공개 단독) ─── */

function ScopeStep({
  selectedChannels,
  isPrivate,
  availableGroups,
  selectedGroupIds,
  onPrivateToggle,
  onChannelToggle,
  onGroupToggle,
}: {
  selectedChannels: ShareChannel[];
  isPrivate: boolean;
  availableGroups: CommunityGroup[];
  selectedGroupIds: string[];
  onPrivateToggle: () => void;
  onChannelToggle: (c: ShareChannel) => void;
  onGroupToggle: (id: string) => void;
}) {
  const isGroupSelected = selectedChannels.includes('group');

  return (
    <div className="space-y-2.5">
      {/* 비공개 — 단독 선택 */}
      <button
        onClick={onPrivateToggle}
        className="w-full flex items-start gap-3.5 p-4 rounded-2xl text-left transition-all"
        style={{
          backgroundColor: isPrivate ? 'rgba(156,163,175,0.12)' : 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${isPrivate ? 'rgba(156,163,175,0.35)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(156,163,175,0.15)' }}>
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">비공개</span>
            {isPrivate && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-500">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">나만 볼 수 있어요. 선택 시 다른 공유는 해제됩니다.</p>
        </div>
      </button>

      {/* 구분선 */}
      <div className="flex items-center gap-2 py-1">
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <span className="text-[11px] text-gray-600">또는 공유 채널 선택 (복수 가능)</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* 전체/학교/그룹 — 멀티 선택 */}
      {CHANNEL_OPTIONS.map(option => {
        const isActive = selectedChannels.includes(option.id);
        const Icon = option.icon;
        return (
          <div key={option.id}>
            <button
              onClick={() => onChannelToggle(option.id)}
              className="w-full flex items-start gap-3.5 p-4 rounded-2xl text-left transition-all"
              style={{
                backgroundColor: isActive ? `${option.color}12` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${isActive ? `${option.color}40` : 'rgba(255,255,255,0.08)'}`,
                opacity: isPrivate ? 0.4 : 1,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${option.color}20` }}>
                <Icon className="w-5 h-5" style={{ color: option.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{option.label}</span>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: option.color }}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{option.description}</p>
              </div>
            </button>

            {/* 그룹 선택 시 인라인으로 그룹 목록 펼침 */}
            {option.id === 'group' && isActive && !isPrivate && (
              <div className="mt-2 ml-3 space-y-1.5">
                {availableGroups.length === 0 ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xs text-gray-500">참여한 그룹이 없어요. 커뮤니티 탭에서 먼저 참여하세요.</span>
                  </div>
                ) : (
                  availableGroups.map(group => {
                    const isGroupChecked = selectedGroupIds.includes(group.id);
                    return (
                      <button
                        key={group.id}
                        onClick={() => onGroupToggle(group.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                        style={{
                          backgroundColor: isGroupChecked ? `${group.color}15` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isGroupChecked ? `${group.color}40` : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        <span className="text-lg flex-shrink-0">{group.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white line-clamp-1">{group.name}</div>
                          <div className="text-[11px] text-gray-500">{group.memberCount}명</div>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                          style={{
                            backgroundColor: isGroupChecked ? group.color : 'rgba(255,255,255,0.08)',
                            border: `1.5px solid ${isGroupChecked ? group.color : 'rgba(255,255,255,0.15)'}`,
                          }}
                        >
                          {isGroupChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export { channelsToShareType };
