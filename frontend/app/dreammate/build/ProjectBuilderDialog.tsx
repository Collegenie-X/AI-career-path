'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Check, ChevronRight, RotateCcw, X } from 'lucide-react';
import type { RoadmapEditorPayload } from '../components/RoadmapEditorDialog';
import type { SharedRoadmap } from '../types';
import { PERIOD_OPTIONS } from './config';
import { getTrack, type TrackDef, type TrackId } from './tracks';
import { makeBuilderId, type BuilderState, type PhaseBlock, type PhaseKey } from './types';
import { templateToBlocks, emptyBlocks, type TemplateLike } from './utils/templateToBlocks';
import { roadmapToBuilderState } from './utils/roadmapToBlocks';
import { builderToPayload } from './utils/blocksToRoadmap';
import { StartPanel } from './components/StartPanel';
import { PhaseSection } from './components/PhaseSection';
import { BlockEditDialog } from './components/BlockEditDialog';
import { ProjectInfoDialog } from './components/ProjectInfoDialog';

interface Props {
  mode: 'create' | 'edit';
  trackId: TrackId;
  initialRoadmap?: SharedRoadmap | null;
  onClose: () => void;
  /** 이전 단계(실행 만들기 선택 화면)로 돌아가기 — 제공되면 헤더에 뒤로가기 버튼 표시 */
  onBack?: () => void;
  onCreate: (payload: RoadmapEditorPayload) => void;
  onUpdate: (payload: RoadmapEditorPayload) => void;
}

/** 빌더 — 680px 다이얼로그. 트랙(프로젝트/논문)별 4단계 섹션 + 클릭→바텀시트 편집 */
export function ProjectBuilderDialog({ mode, trackId, initialRoadmap, onClose, onBack, onCreate, onUpdate }: Props) {
  const track: TrackDef = getTrack(trackId);
  const emptyState = (): BuilderState => ({
    title: '', description: '', period: 'semester', starColor: '#6C5CE7', focusItemType: track.focusItemType, blocks: [],
  });

  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<BuilderState>(() =>
    mode === 'edit' && initialRoadmap ? roadmapToBuilderState(track, initialRoadmap) : emptyState(),
  );
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isEdit = mode === 'edit';
  const hasBlocks = state.blocks.length > 0;
  const editingBlock = state.blocks.find((b) => b.id === editingBlockId) ?? null;
  const filledCount = state.blocks.filter((b) => b.goalTitle.trim()).length;
  const nextOrder = state.blocks.reduce((max, b) => Math.max(max, b.order), -1) + 1;

  const patchState = (patch: Partial<BuilderState>) => setState((s) => ({ ...s, ...patch }));
  const patchBlocks = (fn: (blocks: PhaseBlock[]) => PhaseBlock[]) => setState((s) => ({ ...s, blocks: fn(s.blocks) }));

  const pickTemplate = (tpl: TemplateLike) =>
    setState((s) => ({ ...s, title: s.title || tpl.title, description: s.description || (tpl.description ?? ''), blocks: templateToBlocks(track, tpl) }));
  const startBlank = () => setState((s) => ({ ...s, blocks: emptyBlocks(track) }));
  const reset = () => { setState(isEdit && initialRoadmap ? roadmapToBuilderState(track, initialRoadmap) : emptyState()); setEditingBlockId(null); };

  const addBlock = (phase: PhaseKey) => {
    const block: PhaseBlock = { id: makeBuilderId(), phase, order: nextOrder, goalTitle: '', tasks: [], plannedOutput: '' };
    patchBlocks((b) => [...b, block]);
    setEditingBlockId(block.id);
  };
  const updateBlock = (next: PhaseBlock) => patchBlocks((b) => b.map((x) => (x.id === next.id ? next : x)));
  const deleteBlock = (id: string) => { patchBlocks((b) => b.filter((x) => x.id !== id)); setEditingBlockId(null); };

  const canSave = state.title.trim().length > 0 && filledCount > 0;
  const handleSave = () => {
    if (!canSave) return;
    const payload = builderToPayload(state);
    if (isEdit) onUpdate(payload); else onCreate(payload);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[680px] rounded-t-3xl overflow-hidden flex flex-col shadow-2xl shadow-black/45 ring-1 ring-white/[0.07]"
        style={{ maxHeight: '92vh', background: 'linear-gradient(180deg, #1a1035 0%, #12122a 100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(12,8,28,0.6)' }}>
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <button onClick={onBack} aria-label="뒤로 가기"
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <ArrowLeft className="w-4 h-4 text-gray-300" />
              </button>
            )}
            <span className="text-base flex-shrink-0">{track.emoji}</span>
            <h3 className="text-base font-black text-white truncate">{track.label} 빌더{isEdit && <span className="text-purple-300"> · 수정</span>}</h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={handleSave} disabled={!canSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold text-white disabled:opacity-35"
              style={{ background: 'linear-gradient(135deg,#6C5CE7,#8b5cf6)', boxShadow: '0 4px 14px rgba(108,92,231,0.4)' }}>
              <Check className="w-4 h-4" /> {isEdit ? '수정 완료' : '실행 만들기'}
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-4">
          {!hasBlocks ? (
            <div className="space-y-3">
              <div className="text-center py-1">
                <h1 className="text-base font-black text-white">4단계로 반복하며 완성하는 {track.label}</h1>
                <p className="text-[12px] text-gray-400 mt-1">{track.phases.map((p) => `${p.emoji} ${p.label}`).join(' → ')}</p>
              </div>
              <StartPanel fields={track.galleryFields} onPickTemplate={pickTemplate} onBlank={startBlank} />
            </div>
          ) : (
            <>
              <button onClick={() => setShowInfo(true)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-colors hover:bg-white/[0.04]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: state.starColor }} />
                <div className="min-w-0 flex-1">
                  <div className={`text-[15px] font-black ${state.title.trim() ? 'text-white' : 'text-gray-500 italic'}`}>
                    {state.title.trim() || '프로젝트 제목을 정해주세요'}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {PERIOD_OPTIONS.find((p) => p.id === state.period)?.label} · {state.description.trim() || '한 줄 소개 추가'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
              </button>

              <div className="flex items-center justify-between px-0.5">
                <h2 className="text-[12px] font-bold text-gray-400">단계별 실행 계획 — 영역을 눌러 편집하세요</h2>
                <button onClick={reset} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-white"><RotateCcw className="w-3 h-3" /> 처음부터</button>
              </div>

              <div className="space-y-2.5">
                {track.phases.map((phase, idx) => (
                  <PhaseSection
                    key={phase.key}
                    meta={phase}
                    index={idx}
                    blocks={state.blocks.filter((b) => b.phase === phase.key).sort((a, b) => a.order - b.order)}
                    onOpenBlock={setEditingBlockId}
                    onAddBlock={() => addBlock(phase.key)}
                  />
                ))}
              </div>

              <p className="text-center text-[11px] text-gray-500 pt-1">
                채운 주차 {filledCount}개 · {canSave ? '저장할 수 있어요' : '제목과 주차 1개 이상을 채워주세요'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* 중첩 바텀시트 (블록/정보 편집) */}
      {editingBlock && (
        <BlockEditDialog block={editingBlock} phases={track.phases} onChange={updateBlock} onDelete={() => deleteBlock(editingBlock.id)} onClose={() => setEditingBlockId(null)} />
      )}
      {showInfo && (
        <ProjectInfoDialog state={state} onChange={patchState} onClose={() => setShowInfo(false)} />
      )}
    </div>,
    document.body,
  );
}
