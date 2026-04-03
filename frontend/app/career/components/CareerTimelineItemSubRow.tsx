'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { CareerPathSubItemBranchRow } from './timeline-dream-path/CareerTimelineCareerPathChrome';
import type { PlanItem } from './CareerPathBuilder';

type PlanSubItem = NonNullable<PlanItem['subItems']>[number];

type CareerTimelineSubItemAccordionRowProps = {
  readonly sub: PlanSubItem;
  readonly accentColor: string;
  readonly subIndex: number;
  readonly showDoneToggle: boolean;
  readonly onToggleSubDone?: () => void;
};

/** 타임라인 하위 항목 — 제목 행 + (설명·링크) 아코디언 */
export function CareerTimelineSubItemAccordionRow({
  sub,
  accentColor,
  subIndex,
  showDoneToggle,
  onToggleSubDone,
}: CareerTimelineSubItemAccordionRowProps) {
  const [subDetailOpen, setSubDetailOpen] = useState(false);
  const hasBody = !!(sub.description && sub.description.trim()) || !!sub.url;

  return (
    <div className={subIndex > 0 ? 'pt-1.5 mt-1.5 border-t border-white/[0.05]' : undefined}>
      <CareerPathSubItemBranchRow accentColor={accentColor}>
        <div className="flex flex-1 min-w-0 items-start gap-2">
          {showDoneToggle && onToggleSubDone ? (
            <button
              type="button"
              onClick={onToggleSubDone}
              className="flex-shrink-0 transition-all active:scale-90 mt-0.5"
              style={{ color: sub.done ? accentColor : 'rgba(255,255,255,0.2)' }}
            >
              {sub.done ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Circle style={{ width: 14, height: 14 }} />}
            </button>
          ) : (
            <div className="flex-shrink-0 mt-0.5">
              {sub.done ? (
                <CheckCircle2 style={{ width: 14, height: 14, color: accentColor }} />
              ) : (
                <Circle style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.2)' }} />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <span
                className="text-xs leading-snug"
                style={{
                  color: sub.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)',
                  textDecoration: sub.done ? 'line-through' : 'none',
                }}
              >
                {sub.title}
              </span>
              {hasBody ? (
                <button
                  type="button"
                  onClick={() => setSubDetailOpen((v) => !v)}
                  className="flex-shrink-0 p-0.5 rounded hover:bg-white/[0.06] text-gray-500"
                  aria-expanded={subDetailOpen}
                  title={subDetailOpen ? '상세 접기' : '상세 펼치기'}
                >
                  {subDetailOpen ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                </button>
              ) : null}
            </div>
            {subDetailOpen && hasBody ? (
              <div className="mt-1.5 space-y-1 pl-0.5 border-l border-white/[0.08] ml-0.5 pl-2">
                {sub.description && sub.description.trim() ? (
                  <div className="text-[12px] text-gray-500 leading-relaxed">{sub.description}</div>
                ) : null}
                {sub.url ? (
                  <a
                    href={sub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[12px] text-blue-400 hover:text-blue-300 break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink style={{ width: 9, height: 9 }} />
                    {sub.url}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </CareerPathSubItemBranchRow>
    </div>
  );
}
