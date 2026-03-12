'use client';

import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { LABELS, ROADMAP_SHARE_VISIBILITY_OPTIONS } from '../config';
import type { DreamSpace, RoadmapShareScope } from '../types';

interface RoadmapShareDialogProps {
  currentScope: RoadmapShareScope;
  currentSpaceIds: string[];
  spaces: DreamSpace[];
  onClose: () => void;
  onSave: (scope: RoadmapShareScope, spaceIds: string[]) => void;
}

export function RoadmapShareDialog({
  currentScope,
  currentSpaceIds,
  spaces,
  onClose,
  onSave,
}: RoadmapShareDialogProps) {
  const [shareScope, setShareScope] = useState<RoadmapShareScope>(currentScope);
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>(currentSpaceIds);

  const isSaveDisabled = useMemo(
    () => shareScope === 'space' && selectedSpaceIds.length === 0,
    [selectedSpaceIds.length, shareScope],
  );

  const toggleSpaceSelection = (spaceId: string) => {
    setSelectedSpaceIds(previous => {
      if (previous.includes(spaceId)) {
        return previous.filter(id => id !== spaceId);
      }
      return [...previous, spaceId];
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-hidden"
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
          <div className="space-y-2">
            {ROADMAP_SHARE_VISIBILITY_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setShareScope(option.id)}
                className="w-full text-left rounded-xl px-3 py-2.5"
                style={shareScope === option.id
                  ? { backgroundColor: 'rgba(108,92,231,0.22)', border: '1px solid rgba(168,85,247,0.55)' }
                  : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-xs font-bold text-white">{option.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{option.description}</p>
              </button>
            ))}
          </div>

          {shareScope === 'space' && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-300">{LABELS.shareSpaceSelectLabel}</p>
              {spaces.length === 0 ? (
                <p className="text-[11px] text-gray-500">공유 가능한 스페이스가 없습니다.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {spaces.map(space => {
                    const isSelected = selectedSpaceIds.includes(space.id);
                    return (
                      <button
                        key={space.id}
                        onClick={() => toggleSpaceSelection(space.id)}
                        className="h-10 px-2.5 rounded-lg flex items-center justify-between text-[11px]"
                        style={isSelected
                          ? { backgroundColor: `${space.color}20`, color: '#fff', border: `1px solid ${space.color}66` }
                          : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <span className="truncate">{space.emoji} {space.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={() => onSave(shareScope, selectedSpaceIds)}
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

