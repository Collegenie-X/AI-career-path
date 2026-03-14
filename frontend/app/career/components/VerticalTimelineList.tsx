'use client';

import { useEffect, useState } from 'react';
import {
  Pencil, Plus, Trash2,
  ChevronDown,
  Share2, Globe, EyeOff, Shield,
} from 'lucide-react';
import { GRADE_YEARS } from '../config';
import type { CareerPlan, PlanItem, YearPlan } from './CareerPathBuilder';
import { ItemDetailDialog } from './ItemDetailDialog';
import { ShareSettingsDialog } from './community/ShareSettingsDialog';
import type { ShareType } from './community/types';
import { YearTimelineNode } from './YearTimelineNode';
import type { PlanItemWithCheck } from './TimelineItemComponents';
import { LABELS } from '../config';

/* ─── Types ─── */
type Props = {
  allPlans: CareerPlan[];
  onEdit: (plan: CareerPlan) => void;
  onUpdatePlan: (plan: CareerPlan) => void;
  onDeletePlan: (planId: string) => void;
  onNewPlan: () => void;
  onSharePlan?: (plan: CareerPlan, isPublic: boolean, shareType?: string) => void;
};

/* ─── Single plan accordion card ─── */
function PlanAccordionCard({
  plan, isOpen, onToggle, onEdit, onDelete, onUpdatePlan, onItemInfoClick, onShare,
}: {
  plan: CareerPlan; isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdatePlan: (p: CareerPlan) => void;
  onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
  onShare: (isPublic: boolean, shareType?: ShareType) => void;
}) {
  const gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; return acc; }, {} as Record<string, number>);
  const sortedYears = [...plan.years].sort((a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0));

  const totalItems = plan.years.reduce((s, y) => {
    const goalGroupItemIds = new Set(
      y.semester === 'split'
        ? (y.semesterPlans ?? []).flatMap(sp => sp.goalGroups.flatMap(g => g.items.map(it => it.id)))
        : (y.goalGroups ?? []).flatMap(g => g.items.map(it => it.id))
    );
    const ungroupedDirectItems = y.items.filter(it => !goalGroupItemIds.has(it.id)).length;
    const groupItems = (y.groups ?? []).reduce((gs, g) => gs + g.items.length, 0);
    const goalGroupItems = y.semester === 'split'
      ? (y.semesterPlans ?? []).reduce((ss, sp) => ss + sp.goalGroups.reduce((gs, g) => gs + g.items.length, 0), 0)
      : (y.goalGroups ?? []).reduce((gs, g) => gs + g.items.length, 0);
    return s + ungroupedDirectItems + groupItems + goalGroupItems;
  }, 0);
  const checkedItems = plan.years.reduce((s, y) => {
    const goalGroupItemIds = new Set(
      y.semester === 'split'
        ? (y.semesterPlans ?? []).flatMap(sp => sp.goalGroups.flatMap(g => g.items.map(it => it.id)))
        : (y.goalGroups ?? []).flatMap(g => g.items.map(it => it.id))
    );
    const directChecked = y.items.filter((it) => !goalGroupItemIds.has(it.id) && (it as PlanItemWithCheck).checked).length;
    const groupChecked = (y.groups ?? []).reduce((gs, g) => gs + g.items.filter(it => (it as PlanItemWithCheck).checked).length, 0);
    const goalGroupChecked = y.semester === 'split'
      ? (y.semesterPlans ?? []).reduce((ss, sp) => ss + sp.goalGroups.reduce((gs, g) => gs + g.items.filter(it => (it as PlanItemWithCheck).checked).length, 0), 0)
      : (y.goalGroups ?? []).reduce((gs, g) => gs + g.items.filter(it => (it as PlanItemWithCheck).checked).length, 0);
    return s + directChecked + groupChecked + goalGroupChecked;
  }, 0);

  const updateYear = (updatedYear: YearPlan) =>
    onUpdatePlan({ ...plan, years: plan.years.map((y) => y.gradeId === updatedYear.gradeId ? updatedYear : y) });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareSettings, setShowShareSettings] = useState(false);
  const [editablePlanTitle, setEditablePlanTitle] = useState(plan.title);

  useEffect(() => {
    setEditablePlanTitle(plan.title);
  }, [plan.title]);

  const handleShareConfirm = (selectedShareType: ShareType) => {
    onShare(true, selectedShareType);
    setShowShareSettings(false);
  };

  const handleMakePrivate = () => {
    onShare(false, undefined);
    setShowShareSettings(false);
  };

  const savePlanTitle = () => {
    const trimmedTitle = editablePlanTitle.trim();
    if (!trimmedTitle) {
      setEditablePlanTitle(plan.title);
      return;
    }
    if (trimmedTitle === plan.title) return;
    onUpdatePlan({ ...plan, title: trimmedTitle });
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: `1.5px solid ${isOpen ? plan.starColor + '55' : 'rgba(255,255,255,0.08)'}`,
        background: isOpen
          ? `linear-gradient(180deg, ${plan.starColor}14 0%, ${plan.starColor}06 100%)`
          : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Header row */}
      <div
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('input')) return;
          onToggle();
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: isOpen
              ? `linear-gradient(135deg, ${plan.starColor}33, ${plan.starColor}18)`
              : 'rgba(255,255,255,0.06)',
            border: isOpen ? `1.5px solid ${plan.starColor}55` : '1.5px solid rgba(255,255,255,0.1)',
          }}
        >
          {plan.jobEmoji}
        </div>

        <div className="flex-1 min-w-0">
          {isOpen ? (
            <input
              value={editablePlanTitle}
              onChange={(event) => setEditablePlanTitle(event.target.value)}
              onBlur={savePlanTitle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  savePlanTitle();
                  (event.target as HTMLInputElement).blur();
                }
                if (event.key === 'Escape') {
                  setEditablePlanTitle(plan.title);
                  (event.target as HTMLInputElement).blur();
                }
              }}
              placeholder={(LABELS.explore_use_path_dialog_title_placeholder as string) ?? '나만의 패스 제목 입력'}
              className="w-full h-8 px-2 rounded-lg font-bold text-white text-sm leading-snug outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${plan.starColor}55` }}
            />
          ) : (
            <div className="font-bold text-white text-sm leading-snug truncate">
              {plan.title}
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px] font-semibold" style={{ color: `${plan.starColor}cc` }}>
              {plan.starEmoji} {plan.starName}
            </span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="text-[12px] text-gray-500">{plan.years.length}개 학년</span>
            {totalItems > 0 && (
              <>
                <span className="text-[12px] text-gray-600">·</span>
                <span className="text-[12px] text-gray-500">{checkedItems}/{totalItems} 완료</span>
              </>
            )}
          </div>
          {totalItems > 0 && (
            <div className="mt-1.5 w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(checkedItems / totalItems) * 100}%`, backgroundColor: plan.starColor }} />
            </div>
          )}
        </div>

        <ChevronDown
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            width: 18, height: 18,
            color: isOpen ? plan.starColor : 'rgba(255,255,255,0.3)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      {/* Expanded body */}
      {isOpen && (
        <div style={{ borderTop: `1px solid ${plan.starColor}22` }}>
          {/* Action bar */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex gap-2">
              <button onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={{ backgroundColor: `${plan.starColor}22`, color: plan.starColor, border: `1px solid ${plan.starColor}44` }}>
                <Pencil style={{ width: 13, height: 13 }} />수정하기
              </button>

              <button
                onClick={() => setShowShareSettings(true)}
                className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={plan.isPublic
                  ? plan.shareType === 'operator'
                    ? { backgroundColor: 'rgba(108,92,231,0.18)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.4)' }
                    : { backgroundColor: 'rgba(34,197,94,0.18)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.4)' }
                  : { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)' }
                }
              >
                {plan.isPublic
                  ? plan.shareType === 'operator'
                    ? <><Shield style={{ width: 13, height: 13 }} />운영자 공유</>
                    : <><Globe style={{ width: 13, height: 13 }} />전체 공유</>
                  : <><Share2 style={{ width: 13, height: 13 }} />공유</>
                }
              </button>

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)' }}>
                  <Trash2 style={{ width: 13, height: 13 }} />삭제
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="h-9 px-3 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                    취소
                  </button>
                  <button onClick={onDelete}
                    className="h-9 px-3 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: '#ef4444', color: '#fff' }}>
                    삭제 확인
                  </button>
                </div>
              )}
            </div>

            {plan.isPublic && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{
                  backgroundColor: plan.shareType === 'operator' ? 'rgba(108,92,231,0.08)' : 'rgba(34,197,94,0.08)',
                  border: `1px solid ${plan.shareType === 'operator' ? 'rgba(108,92,231,0.2)' : 'rgba(34,197,94,0.2)'}`,
                }}>
                {plan.shareType === 'operator'
                  ? <Shield style={{ width: 14, height: 14, color: '#a78bfa', flexShrink: 0 }} />
                  : <Globe style={{ width: 14, height: 14, color: '#22C55E', flexShrink: 0 }} />
                }
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">
                    {plan.shareType === 'operator' ? '운영자에게 공유됨' : '커뮤니티에 공개됨'}
                  </div>
                  <div className="text-[12px] text-gray-400">
                    {plan.shareType === 'operator'
                      ? '진로 선생님이 확인하고 코멘트를 남길 수 있어요'
                      : '같은 학교 친구들이 보고 코멘트를 남길 수 있어요'
                    }
                  </div>
                </div>
                <button
                  onClick={handleMakePrivate}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold flex-shrink-0 transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <EyeOff style={{ width: 11, height: 11 }} />비공개
                </button>
              </div>
            )}

            {showShareSettings && (
              <ShareSettingsDialog
                planTitle={plan.title}
                currentShareType={plan.isPublic ? (plan.shareType as ShareType ?? 'public') : null}
                onConfirm={handleShareConfirm}
                onMakePrivate={handleMakePrivate}
                onClose={() => setShowShareSettings(false)}
              />
            )}
          </div>

          {/* Vertical timeline */}
          <div className="relative px-4 pb-4">
            <div className="absolute left-[38px] top-0 bottom-4 w-0.5"
              style={{ backgroundColor: `${plan.starColor}28` }} />
            <div className="space-y-0">
              {sortedYears.map((year, idx) => (
                <YearTimelineNode
                  key={year.gradeId}
                  year={year as YearPlan & { items: PlanItemWithCheck[] }}
                  color={plan.starColor}
                  isLast={idx === sortedYears.length - 1}
                  isEditMode={false}
                  onUpdateYear={updateYear}
                  onItemInfoClick={onItemInfoClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main export ─── */
export function VerticalTimelineList({ allPlans, onEdit, onUpdatePlan, onDeletePlan, onNewPlan, onSharePlan }: Props) {
  const [openPlanId, setOpenPlanId] = useState<string | null>(allPlans[0]?.id ?? null);
  const [detailItem, setDetailItem] = useState<{ item: PlanItem; gradeLabel: string } | null>(null);

  const toggle = (planId: string) =>
    setOpenPlanId((prev) => (prev === planId ? null : planId));

  if (allPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}>
          <span className="text-4xl">🗺️</span>
        </div>
        <div>
          <div className="text-base font-bold text-white">아직 커리어 패스가 없어요</div>
          <div className="text-sm text-gray-400 mt-1">빌더에서 나만의 로드맵을 만들어보세요</div>
        </div>
        <button onClick={onNewPlan}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}>
          <Plus style={{ width: 16, height: 16 }} />커리어 패스 만들기
        </button>
      </div>
    );
  }

  const findPlanColorForItem = (itemId: string): string => {
    const found = allPlans.find((p) => p.years.some((y) => {
      if (y.items.some((it) => it.id === itemId)) return true;
      if ((y.groups ?? []).some(g => g.items.some(it => it.id === itemId))) return true;
      if (y.semester === 'split') {
        return (y.semesterPlans ?? []).some(sp => sp.goalGroups.some(g => g.items.some(it => it.id === itemId)));
      }
      return (y.goalGroups ?? []).some(g => g.items.some(it => it.id === itemId));
    }));
    return found?.starColor ?? '#6C5CE7';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          내 커리어 패스 ({allPlans.length})
        </div>
        <button onClick={onNewPlan}
          className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}>
          <Plus style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {allPlans.map((plan) => (
        <PlanAccordionCard
          key={plan.id}
          plan={plan}
          isOpen={openPlanId === plan.id}
          onToggle={() => toggle(plan.id)}
          onEdit={() => onEdit(plan)}
          onDelete={() => { onDeletePlan(plan.id); if (openPlanId === plan.id) setOpenPlanId(null); }}
          onUpdatePlan={onUpdatePlan}
          onItemInfoClick={(item, gradeLabel) => setDetailItem({ item, gradeLabel })}
          onShare={(isPublic, shareType) => {
            const updated = {
              ...plan,
              isPublic,
              shareType: isPublic ? shareType : undefined,
              sharedAt: isPublic ? new Date().toISOString() : undefined,
            };
            onUpdatePlan(updated);
            onSharePlan?.(updated, isPublic, shareType);
          }}
        />
      ))}

      {detailItem && (
        <ItemDetailDialog
          item={detailItem.item}
          gradeLabel={detailItem.gradeLabel}
          color={findPlanColorForItem(detailItem.item.id)}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  );
}
