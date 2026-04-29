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
  readonly priority?: 'must' | 'boost' | 'optional';
  readonly projectTrack?: boolean;
  readonly aiTools?: readonly string[];
  readonly deliverable?: string;
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
        <div className="flex-1 min-w-0">
          {(item.priority === 'must' || item.priority === 'boost' || item.projectTrack) && (
            <div className="flex flex-wrap gap-1 mb-1">
              {item.priority === 'must' && (
                <span
                  className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: '#fff',
                    boxShadow: '0 0 6px rgba(239,68,68,0.45)',
                  }}
                  title="합격 결정타 — 이 시기 반드시 챙겨야 하는 항목"
                >
                  🔥 핵심
                </span>
              )}
              {item.priority === 'boost' && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: 'rgba(167,139,250,0.18)',
                    border: '1px solid rgba(167,139,250,0.55)',
                    color: '#c4b5fd',
                  }}
                  title="가산점 — 있으면 강력한 차별화 요소"
                >
                  ⚡ 가산점
                </span>
              )}
              {item.projectTrack && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: 'rgba(34,197,94,0.16)',
                    border: '1px solid rgba(34,197,94,0.5)',
                    color: '#86efac',
                  }}
                  title="AI 도구를 직접 활용하는 프로젝트 트랙"
                >
                  🤖 AI 프로젝트
                </span>
              )}
            </div>
          )}
          <div className="text-[13px] font-semibold text-white leading-snug">{item.title}</div>
        </div>
        {hasExpandableBody || (item.aiTools && item.aiTools.length > 0) || item.deliverable ? (
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
      {open ? (
        <>
          {hasExpandableBody ? (
            <CareerPathTimelineItemDetailTree
              typeAccent={tone}
              organizer={organizerTrim || null}
              description={descTrim ? item.description ?? null : null}
              linkHref={linkHref}
              linkLabel={linkLabel}
            />
          ) : null}
          {item.aiTools && item.aiTools.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              <span className="text-[10px] text-gray-500">🛠️</span>
              {item.aiTools.map((tool, ti) => (
                <span
                  key={`${tool}-${ti}`}
                  className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                  style={{
                    backgroundColor: 'rgba(96,165,250,0.14)',
                    border: '1px solid rgba(96,165,250,0.35)',
                    color: '#bfdbfe',
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          ) : null}
          {item.deliverable ? (
            <div
              className="mt-2 text-[11px] flex items-start gap-1 px-1.5 py-1 rounded-md"
              style={{
                backgroundColor: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.25)',
                color: '#fde68a',
              }}
            >
              <span>🎁</span>
              <span>
                <span className="font-bold">산출물:</span> {item.deliverable}
              </span>
            </div>
          ) : null}
        </>
      ) : null}
    </CareerPathTimelineItemCardShell>
  );
}
