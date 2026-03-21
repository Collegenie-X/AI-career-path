'use client';

import { useMemo, useState } from 'react';
import { Check, Lock, X } from 'lucide-react';
import { LABELS, ROADMAP_SHARE_VISIBILITY_OPTIONS } from '../config';
import type { DreamSpace, RoadmapShareChannel } from '../types';

const SHARE_CHANNEL_OPTIONS = ROADMAP_SHARE_VISIBILITY_OPTIONS.filter(
  opt => opt.id === 'public' || opt.id === 'space',
) as readonly { id: RoadmapShareChannel; label: string; description: string; emoji: string; color: string }[];

interface RoadmapShareDialogProps {
  currentShareChannels: RoadmapShareChannel[];
  currentSpaceIds: string[];
  spaces: DreamSpace[];
  canSharePublicly?: boolean;
  onClose: () => void;
  onSave: (shareChannels: RoadmapShareChannel[], spaceIds: string[]) => void;
}

export function RoadmapShareDialog({
  currentShareChannels,
  currentSpaceIds,
  spaces,
  canSharePublicly = true,
  onClose,
  onSave,
}: RoadmapShareDialogProps) {
  const [shareChannels, setShareChannels] = useState<RoadmapShareChannel[]>(currentShareChannels);
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>(currentSpaceIds);

  const isPrivate = shareChannels.length === 0;

  const handlePrivateToggle = () => {
    setShareChannels([]);
    setSelectedSpaceIds([]);
  };

  const handleChannelToggle = (channel: RoadmapShareChannel) => {
    if (channel === 'public' && !canSharePublicly) return;
    setShareChannels(prev => {
      const next = prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel];
      if (channel === 'space' && !next.includes('space')) {
        setSelectedSpaceIds([]);
      }
      return next;
    });
  };

  const toggleSpaceSelection = (spaceId: string) => {
    setSelectedSpaceIds(prev =>
      prev.includes(spaceId) ? prev.filter(id => id !== spaceId) : [...prev, spaceId],
    );
  };

  const isSpaceSelected = shareChannels.includes('space');
  const isSaveDisabled = useMemo(
    () =>
      !isPrivate &&
      ((isSpaceSelected && selectedSpaceIds.length === 0) ||
        (shareChannels.includes('public') && !canSharePublicly)),
    [canSharePublicly, isPrivate, isSpaceSelected, selectedSpaceIds.length, shareChannels],
  );

  const handleSave = () => {
    if (isSaveDisabled) return;
    onSave(shareChannels, isSpaceSelected ? selectedSpaceIds : []);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[645px] rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 56 }}
      >
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="text-base font-black text-white">{LABELS.shareDialogTitle}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        <div className="px-5 pb-4 space-y-4">
          {/* 비공개 — 단독 선택. 선택 시 전체/그룹 공유 해제 */}
          <button
            onClick={handlePrivateToggle}
            className="w-full text-left rounded-xl px-3 py-2.5 flex items-start gap-3"
            style={
              isPrivate
                ? { backgroundColor: 'rgba(108,92,231,0.22)', border: '1px solid rgba(168,85,247,0.55)' }
                : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(148,163,184,0.15)' }}
            >
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">
                  {ROADMAP_SHARE_VISIBILITY_OPTIONS.find(o => o.id === 'private')?.label ?? '비공개'}
                </p>
                {isPrivate && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">
                {ROADMAP_SHARE_VISIBILITY_OPTIONS.find(o => o.id === 'private')?.description ??
                  '내 활동에서만 보입니다.'}
              </p>
            </div>
          </button>

          {/* 구분선 */}
          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <span className="text-[13px] text-gray-600">또는 공유 채널 선택 (복수 가능)</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* 전체 공유 / 그룹 공유 — 멀티 선택 */}
          {SHARE_CHANNEL_OPTIONS.map(option => {
            const isPublicWithoutResult = option.id === 'public' && !canSharePublicly;
            /** 비공개 ↔ 채널 전환은 클릭으로 가능해야 함. 전체 공유만 결과물 없으면 비활성 */
            const isChannelDisabled = isPublicWithoutResult;
            const isActive = shareChannels.includes(option.id);
            return (
              <div key={option.id}>
                <button
                  onClick={() => handleChannelToggle(option.id)}
                  disabled={isChannelDisabled}
                  className="w-full text-left rounded-xl px-3 py-2.5 flex items-start gap-3 disabled:cursor-not-allowed disabled:pointer-events-none"
                  style={{
                    backgroundColor:
                      isActive && !isChannelDisabled
                        ? `${option.color}22`
                        : isChannelDisabled
                          ? 'rgba(148,163,184,0.06)'
                          : 'rgba(255,255,255,0.04)',
                    border:
                      isActive && !isChannelDisabled
                        ? `1px solid ${option.color}55`
                        : '1px solid rgba(255,255,255,0.08)',
                    opacity: isChannelDisabled ? 0.55 : isPrivate && !isActive ? 0.85 : 1,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${option.color}20` }}
                  >
                    <span className="text-sm">{option.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{option.label}</p>
                      {isActive && !isChannelDisabled && (
                        <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
                    {isPublicWithoutResult && (
                      <p className="text-sm text-amber-300 mt-1">
                        {LABELS.sharePublicRequiresResultHint ??
                          '최종 결과물 URL 또는 이미지 URL을 등록하면 전체 공유할 수 있어요.'}
                      </p>
                    )}
                  </div>
                </button>

                {option.id === 'space' && isActive && !isPrivate && (
                  <div className="mt-2 ml-3 space-y-2">
                    <p className="text-sm font-bold text-gray-300">{LABELS.shareSpaceSelectLabel}</p>
                    {spaces.length === 0 ? (
                      <p className="text-sm text-gray-500">공유 가능한 스페이스가 없습니다.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {spaces.map(space => {
                          const isSelected = selectedSpaceIds.includes(space.id);
                          return (
                            <button
                              key={space.id}
                              onClick={() => toggleSpaceSelection(space.id)}
                              className="h-10 px-2.5 rounded-lg flex items-center justify-between text-sm"
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: `${space.color}20`,
                                      color: '#fff',
                                      border: `1px solid ${space.color}66`,
                                    }
                                  : {
                                      backgroundColor: 'rgba(255,255,255,0.04)',
                                      color: 'rgba(255,255,255,0.6)',
                                      border: '1px solid rgba(255,255,255,0.08)',
                                    }
                              }
                            >
                              <span className="truncate">
                                {space.emoji} {space.name}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={isSaveDisabled}
            className="w-full h-11 rounded-2xl text-sm font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {LABELS.shareSaveButton}
          </button>
        </div>
      </div>
    </div>
  );
}
