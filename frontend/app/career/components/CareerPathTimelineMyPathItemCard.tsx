'use client';

import {
  Trash2,
  CheckCircle2, Circle, MoreHorizontal,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { ITEM_TYPES } from '../config';
import type { PlanItem } from './CareerPathBuilder';
import { InlineTitle } from './TimelineInlineTitle';
import { careerPathSubActivitiesLabel } from './timeline-dream-path/CareerTimelineCareerPathChrome';
import {
  CareerPathTimelineItemCardShell,
  CareerPathTimelineItemDetailTree,
  CareerPathTimelineItemMetaRow,
} from './timeline-dream-path/CareerPathTimelineItemSharedChrome';
import { CareerTimelineSubItemAccordionRow } from './CareerTimelineItemSubRow';
import type { PlanItemWithCheck } from '../types/timelinePlanItemTypes';

type CareerPathTimelineMyPathItemCardProps = {
  readonly item: PlanItemWithCheck;
  readonly color: string;
  readonly checked: boolean;
  readonly showCheckbox: boolean;
  readonly isEditMode: boolean;
  readonly detailExpanded: boolean;
  readonly setDetailExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  readonly monthLabel: string;
  readonly descTrim: string;
  readonly organizerTrim: string;
  readonly linkHref: string | undefined;
  readonly linkLabel: string;
  readonly hasExpandableDetails: boolean;
  readonly subItems: NonNullable<PlanItem['subItems']>;
  readonly doneCount: number;
  readonly onToggleCheck: () => void;
  readonly onDelete: () => void;
  readonly onTitleSave: (t: string) => void;
  readonly onInfoClick: () => void;
  readonly onToggleSubItemDone?: (itemId: string, subItemId: string) => void;
  readonly handleTitleActivate: () => void;
};

/**
 * 내 패스 타임라인 항목 — 공통 크롬(CareerPathTimelineItemSharedChrome) 재사용
 */
export function CareerPathTimelineMyPathItemCard({
  item,
  color,
  checked,
  showCheckbox,
  isEditMode,
  detailExpanded,
  setDetailExpanded,
  monthLabel,
  descTrim,
  organizerTrim,
  linkHref,
  linkLabel,
  hasExpandableDetails,
  subItems,
  doneCount,
  onToggleCheck,
  onDelete,
  onTitleSave,
  onInfoClick,
  onToggleSubItemDone,
  handleTitleActivate,
}: CareerPathTimelineMyPathItemCardProps) {
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type);
  const typeAccent = typeConf?.color ?? color;
  const emoji = typeConf?.emoji ?? '📌';
  const costHidden = item.cost === '무료' || item.cost === '자체 제작';

  return (
    <div className={`relative transition-all rounded-lg ${checked ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-2">
        {showCheckbox ? (
          <button
            type="button"
            onClick={onToggleCheck}
            className="flex-shrink-0 mt-1 transition-all active:scale-90"
            style={{ color: checked ? typeConf?.color ?? color : 'rgba(255,255,255,0.2)' }}
          >
            {checked ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : <Circle style={{ width: 18, height: 18 }} />}
          </button>
        ) : null}

        <div className="flex-1 min-w-0">
          <CareerPathTimelineItemCardShell typeAccent={typeAccent} typeEmoji={emoji}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 pr-1">
                {isEditMode ? (
                  <InlineTitle value={item.title} color={typeConf?.color ?? color} onSave={onTitleSave} />
                ) : (
                  <button
                    type="button"
                    onClick={handleTitleActivate}
                    className="text-left text-[13px] font-semibold text-white leading-snug w-full hover:opacity-90"
                    title={hasExpandableDetails ? '펼치기·접기' : '상세 보기'}
                  >
                    {item.title}
                  </button>
                )}
              </div>
              {hasExpandableDetails ? (
                <button
                  type="button"
                  onClick={() => setDetailExpanded((v) => !v)}
                  className="flex-shrink-0 p-1 rounded-md hover:bg-white/[0.06] text-gray-400"
                  aria-expanded={detailExpanded}
                  title={detailExpanded ? '접기' : '펼치기'}
                >
                  {detailExpanded ? <ChevronUp style={{ width: 18, height: 18 }} /> : <ChevronDown style={{ width: 18, height: 18 }} />}
                </button>
              ) : null}
            </div>

            <CareerPathTimelineItemMetaRow
              typeAccent={typeAccent}
              typeLabel={typeConf?.label ?? ''}
              monthLabel={monthLabel}
              cost={item.cost}
              costVisible={!costHidden && !!item.cost}
              difficulty={item.difficulty}
              trailingSlot={
                subItems.length > 0 && showCheckbox ? (
                  <span className="text-[11px] font-bold text-gray-600 tabular-nums">
                    하위 {doneCount}/{subItems.length}
                  </span>
                ) : null
              }
            />

            {detailExpanded && hasExpandableDetails ? (
              <CareerPathTimelineItemDetailTree
                typeAccent={typeAccent}
                organizer={organizerTrim && organizerTrim !== '개인' ? organizerTrim : null}
                description={descTrim ? item.description : null}
                linkHref={linkHref}
                linkLabel={linkLabel}
              >
                {subItems.length > 0 ? (
                  <div className="pt-1 space-y-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600 mb-1.5">
                      {careerPathSubActivitiesLabel()}
                    </p>
                    {subItems.map((sub, subIndex) => (
                      <CareerTimelineSubItemAccordionRow
                        key={sub.id}
                        sub={sub}
                        accentColor={typeAccent}
                        subIndex={subIndex}
                        showDoneToggle={!!showCheckbox && !!onToggleSubItemDone}
                        onToggleSubDone={
                          onToggleSubItemDone ? () => onToggleSubItemDone(item.id, sub.id) : undefined
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </CareerPathTimelineItemDetailTree>
            ) : null}
          </CareerPathTimelineItemCardShell>
        </div>

        {isEditMode ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={onInfoClick}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <MoreHorizontal style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }} />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
            >
              <Trash2 style={{ width: 13, height: 13, color: '#ef4444' }} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
