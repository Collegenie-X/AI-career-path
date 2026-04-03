'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ITEM_TYPES } from '../../config';
import {
  CareerPathTimelineItemCardShell,
  CareerPathTimelineItemDetailTree,
  CareerPathTimelineItemMetaRow,
} from './CareerPathTimelineItemSharedChrome';
import {
  buildTimelineMonthLabelFromMonths,
  deriveTemplateTimelineExpandableBody,
  deriveTimelineItemLinkFields,
  normalizeTimelineItemMonths,
} from '../../utils/careerPathTimelineItemDerivations';

type TemplateItemLike = {
  readonly id?: string;
  readonly title?: string;
  readonly type?: string;
  readonly months?: number[];
  readonly month?: number;
  readonly cost?: string;
  readonly difficulty?: number;
  readonly organizer?: string;
  readonly description?: string;
  readonly url?: string;
  readonly links?: { readonly url?: string; readonly title?: string }[];
};

type CareerPathTimelineTemplateItemRowProps = {
  readonly item: TemplateItemLike;
  readonly accentColor: string;
};

/**
 * 탐색 템플릿 타임라인 — 제목·메타 고정, 설명·주최·링크는 아코디언(내 패스와 동일한 크롬·트리 UX)
 */
export function CareerPathTimelineTemplateItemRow({
  item,
  accentColor,
}: CareerPathTimelineTemplateItemRowProps) {
  const [open, setOpen] = useState(false);
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type);
  const months = normalizeTimelineItemMonths(item);
  const monthLabel = buildTimelineMonthLabelFromMonths(months);
  const { linkHref, linkLabel } = deriveTimelineItemLinkFields(item);
  const { descTrim, hasExpandableBody } = deriveTemplateTimelineExpandableBody(item);
  const tone = typeConf?.color ?? accentColor;
  const costHidden = item.cost === '무료' || item.cost === '자체 제작';
  const organizerTrim = item.organizer?.trim() ?? '';

  return (
    <CareerPathTimelineItemCardShell
      typeAccent={tone}
      typeEmoji={typeConf?.emoji ?? '📌'}
      className="hover:bg-white/[0.02]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[13px] font-semibold text-white leading-snug">{item.title}</div>
        {hasExpandableBody ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex-shrink-0 p-1 rounded-md hover:bg-white/[0.06] text-gray-500"
            aria-expanded={open}
            title={open ? '접기' : '펼치기'}
          >
            {open ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
          </button>
        ) : null}
      </div>
      <CareerPathTimelineItemMetaRow
        typeAccent={tone}
        typeLabel={typeConf?.label ?? ''}
        monthLabel={monthLabel}
        cost={item.cost}
        costVisible={!costHidden && !!item.cost}
        difficulty={item.difficulty}
      />
      {open && hasExpandableBody ? (
        <CareerPathTimelineItemDetailTree
          typeAccent={tone}
          organizer={organizerTrim || null}
          description={descTrim ? item.description ?? null : null}
          linkHref={linkHref}
          linkLabel={linkLabel}
        />
      ) : null}
    </CareerPathTimelineItemCardShell>
  );
}
