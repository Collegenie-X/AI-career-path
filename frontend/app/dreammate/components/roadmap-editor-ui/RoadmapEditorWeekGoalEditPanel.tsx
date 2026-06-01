'use client';

import { ImagePlus, Trash2, X } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type { RoadmapGoalComment, RoadmapGoalStatus, RoadmapTodoItem } from '../../types';
import type { WeekGroupViewModel } from './roadmapEditorWbsTypes';
import { RoadmapEditorWeekGoalComments } from './RoadmapEditorWeekGoalComments';
import { ROADMAP_GOAL_STATUSES, getGoalStatus } from '../../utils/roadmapGoalStatus';

const softField =
  'w-full rounded-lg text-white placeholder-gray-500 outline-none border-0 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]';

const wbsSubToolbarButtonClassName =
  'text-[13px] font-bold px-2 py-1 rounded-lg bg-sky-500/18 text-sky-200 hover:bg-sky-500/28 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45';

/** 첨부 이미지를 data URL로 읽어 outputImageUrl에 저장 (프로토타입: 로컬 보관) */
function readImageFileAsDataUrl(file: File, onLoad: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string') onLoad(reader.result);
  };
  reader.readAsDataURL(file);
}

export interface RoadmapEditorWeekGoalEditPanelLabels {
  weekGoalLabel: string;
  weekGoalEditHelpHint?: string;
  weekGoalRequiredHint: string;
  goalOutputLabel: string;
  subItemSectionLabel: string;
  addSubItemButton: string;
  statusSectionLabel: string;
}

interface RoadmapEditorWeekGoalEditPanelProps {
  group: WeekGroupViewModel;
  labels: RoadmapEditorWeekGoalEditPanelLabels;
  weekGoalPlaceholderTemplate: string;
  weekTaskPlaceholderTemplate: string;
  onUpsertWeekGoal: (groupKey: string, title: string) => void;
  onSetGoalStatus: (groupKey: string, nextStatus: RoadmapGoalStatus) => void;
  onUpdateSubItem: (subItemId: string, patch: Partial<RoadmapTodoItem>) => void;
  onRemoveSubItem: (subItemId: string) => void;
  onAddWeekTask: (groupKey: string) => void;
  autocompleteListId: string;
  autocompleteSuggestions: readonly string[];
}

/**
 * 한 주차 목표의 전체 편집 패널 — 목표·상태(Jira)·산출물·코멘트·하위 항목.
 * 인라인/팝업 어디서든 같은 UI로 재사용한다.
 */
export function RoadmapEditorWeekGoalEditPanel({
  group,
  labels,
  weekGoalPlaceholderTemplate,
  weekTaskPlaceholderTemplate,
  onUpsertWeekGoal,
  onSetGoalStatus,
  onUpdateSubItem,
  onRemoveSubItem,
  onAddWeekTask,
  autocompleteListId,
  autocompleteSuggestions,
}: RoadmapEditorWeekGoalEditPanelProps) {
  const groupKey = group.groupKey;
  const hasGoalText = (group.goal?.title.trim().length ?? 0) > 0;
  const hasTaskText = group.tasks.some(task => task.title.trim().length > 0);
  const isMissingGoal = hasTaskText && !hasGoalText;
  const currentStatus = getGoalStatus(group.goal);

  return (
    <div className="space-y-2">
      <div className="space-y-2 rounded-lg bg-violet-500/[0.07] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <label className="mb-0.5 block text-[13px] text-gray-500">{labels.weekGoalLabel}</label>
        {labels.weekGoalEditHelpHint ? (
          <p className="mb-1 text-[10px] leading-snug text-gray-500">{labels.weekGoalEditHelpHint}</p>
        ) : null}
        <input
          value={group.goal?.title ?? ''}
          onChange={event => onUpsertWeekGoal(groupKey, event.target.value)}
          placeholder={weekGoalPlaceholderTemplate
            .replaceAll('{month}', String(group.month))
            .replaceAll('{week}', String(group.week))}
          className={`${softField} h-8 px-2.5 text-[11px] ${
            isMissingGoal ? 'ring-2 ring-red-400/35 ring-inset' : ''
          }`}
        />
        {isMissingGoal && <p className="mt-0.5 text-[10px] text-red-300">{labels.weekGoalRequiredHint}</p>}

        {/* 상태(Jira) — goal 행이 생성된 뒤 바로 표시. 변경 시 상태 전이가 코멘트에 자동 기록됨 */}
        {group.goal && (
          <div className="mt-1.5 space-y-1">
            <label className="block text-[13px] text-gray-500">{labels.statusSectionLabel}</label>
            <div className="flex flex-wrap gap-1">
              {ROADMAP_GOAL_STATUSES.map(status => {
                const isActive = currentStatus === status.key;
                return (
                  <button
                    key={status.key}
                    type="button"
                    onClick={() => onSetGoalStatus(groupKey, status.key)}
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold transition-all"
                    style={{
                      backgroundColor: isActive ? `${status.color}26` : 'rgba(255,255,255,0.06)',
                      color: isActive ? status.color : 'rgba(255,255,255,0.45)',
                      border: isActive ? `1px solid ${status.color}66` : '1px solid transparent',
                    }}
                  >
                    {status.emoji} {status.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {group.goal && (
          <div className="mt-1.5 space-y-1.5">
            <label className="block text-[13px] text-gray-500">{labels.goalOutputLabel}</label>

            {/* 산출물 ① 이미지 — 첨부 또는 미리보기 */}
            {group.goal.outputImageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={group.goal.outputImageUrl} alt="산출물 이미지" className="max-h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => onUpdateSubItem(group.goal!.id, { outputImageUrl: undefined })}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white transition-colors hover:bg-black/75"
                  aria-label="이미지 제거"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.03] py-2 text-[11px] font-semibold text-gray-400 transition-colors hover:bg-white/[0.06]">
                <ImagePlus className="h-3.5 w-3.5 text-sky-300" />
                이미지 첨부
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      readImageFileAsDataUrl(file, dataUrl =>
                        onUpdateSubItem(group.goal!.id, { outputImageUrl: dataUrl }),
                      );
                    }
                    event.target.value = '';
                  }}
                />
              </label>
            )}

            {/* 산출물 ② 전체 내용 컨텐츠 */}
            <textarea
              value={group.goal.outputContent ?? ''}
              onChange={event => onUpdateSubItem(group.goal!.id, { outputContent: event.target.value })}
              placeholder="산출물의 전체 내용을 적어 주세요 (글·설명·정리 등)"
              rows={3}
              className={`${softField} resize-none px-2 py-1.5 text-[11px] leading-relaxed`}
            />

            {/* 목표별 Jira 스타일 코멘트 — 진짜 문제·바뀐 변화·상태 변경 추적 */}
            <RoadmapEditorWeekGoalComments
              comments={group.goal.comments ?? []}
              onChange={(nextComments: RoadmapGoalComment[]) =>
                onUpdateSubItem(group.goal!.id, { comments: nextComments })
              }
            />
          </div>
        )}
      </div>

      <>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[13px] font-semibold text-gray-500">{labels.subItemSectionLabel}</span>
          <button type="button" onClick={() => onAddWeekTask(groupKey)} className={wbsSubToolbarButtonClassName}>
            + {labels.addSubItemButton}
          </button>
        </div>

        <div className="space-y-1.5">
          {group.tasks.map(subItem => (
            <div
              key={subItem.id}
              className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] py-1 pl-1 pr-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <input
                value={subItem.title}
                onChange={event => onUpdateSubItem(subItem.id, { title: event.target.value })}
                placeholder={weekTaskPlaceholderTemplate
                  .replaceAll('{month}', String(group.month))
                  .replaceAll('{week}', String(group.week))}
                list={autocompleteListId}
                className={`${softField} h-8 flex-1 px-2.5 text-[11px]`}
              />
              <button
                type="button"
                onClick={() => onRemoveSubItem(subItem.id)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400 transition-colors hover:bg-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/35"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {group.tasks.length === 0 && (
            <p className="py-1 text-[11px] text-gray-600">항목 없음</p>
          )}
        </div>

        <datalist id={autocompleteListId}>
          {autocompleteSuggestions.map(suggestion => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      </>
    </div>
  );
}
