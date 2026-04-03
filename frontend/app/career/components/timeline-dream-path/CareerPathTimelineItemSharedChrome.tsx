'use client';

import type { ReactNode } from 'react';
import { Calendar, Link as LinkIcon } from 'lucide-react';

/** 카드 내부 inset (config로 옮기려면 timelineCareerPathChrome.json에 동일 문자열 추가) */
export const CAREER_TIMELINE_ITEM_CARD_INSET_SHADOW = 'inset 0 0 0 1px rgba(255,255,255,0.04)';

type CareerPathTimelineItemCardShellProps = {
  readonly typeAccent: string;
  readonly typeEmoji: string;
  readonly children: ReactNode;
  readonly className?: string;
};

/**
 * 탐색·내 패스 공통 — 좌측 컬러 보더 카드 + 타입 이모지 박스 + 본문 슬롯
 */
export function CareerPathTimelineItemCardShell({
  typeAccent,
  typeEmoji,
  children,
  className = '',
}: CareerPathTimelineItemCardShellProps) {
  return (
    <div
      className={`flex items-start gap-2.5 px-2 py-1.5 rounded-lg overflow-hidden transition-colors ${className}`}
      style={{
        backgroundColor: `${typeAccent}08`,
        borderLeft: `2px solid ${typeAccent}`,
        boxShadow: CAREER_TIMELINE_ITEM_CARD_INSET_SHADOW,
      }}
    >
      <div
        className="rounded-md flex items-center justify-center text-[15px] flex-shrink-0 w-[30px] h-[30px]"
        style={{ backgroundColor: `${typeAccent}18` }}
      >
        {typeEmoji}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

type CareerPathTimelineItemMetaRowProps = {
  readonly typeAccent: string;
  readonly typeLabel: string;
  readonly monthLabel: string;
  readonly cost?: string | null;
  /** 무료·자체 제작 등 숨김은 호출부에서 처리한 문자열만 전달 */
  readonly costVisible?: boolean;
  readonly difficulty?: number | null;
  readonly trailingSlot?: ReactNode;
};

/** 유형 뱃지·달력·비용·난이도 별·(선택) 꼬리 슬롯 */
export function CareerPathTimelineItemMetaRow({
  typeAccent,
  typeLabel,
  monthLabel,
  cost,
  costVisible = true,
  difficulty,
  trailingSlot,
}: CareerPathTimelineItemMetaRowProps) {
  return (
    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
      <span
        className="text-[12px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: `${typeAccent}28`, color: typeAccent }}
      >
        {typeLabel}
      </span>
      <span className="text-[12px] text-gray-500 flex items-center gap-0.5">
        <Calendar style={{ width: 10, height: 10 }} />
        {monthLabel}
      </span>
      {costVisible && cost ? (
        <span className="text-[12px] text-gray-500">{cost}</span>
      ) : null}
      {difficulty != null && difficulty > 0 ? (
        <span className="text-[12px] text-gray-500 tabular-nums">
          {'★'.repeat(difficulty)}
          {'☆'.repeat(Math.max(0, 5 - difficulty))}
        </span>
      ) : null}
      {trailingSlot}
    </div>
  );
}

type CareerPathTimelineItemDetailTreeProps = {
  readonly typeAccent: string;
  readonly organizer?: string | null;
  readonly description?: string | null;
  readonly linkHref?: string;
  readonly linkLabel: string;
  readonly children?: ReactNode;
};

/** 펼친 본문 — 세로 트리(주최 → 설명 → 링크) + 하위 슬롯(하위 활동 등) */
export function CareerPathTimelineItemDetailTree({
  typeAccent,
  organizer,
  description,
  linkHref,
  linkLabel,
  children,
}: CareerPathTimelineItemDetailTreeProps) {
  return (
    <div
      className="mt-2.5 border-l-2 ml-0.5 pl-3 space-y-2.5"
      style={{ borderLeftColor: `${typeAccent}35` }}
    >
      {organizer ? (
        <div className="text-[13px] text-gray-400 flex items-center gap-1.5">
          <span aria-hidden>🏢</span>
          {organizer}
        </div>
      ) : null}
      {description ? (
        <div className="text-[13px] text-gray-400 leading-relaxed">{description}</div>
      ) : null}
      {linkHref ? (
        <a
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] text-blue-400 hover:underline break-all"
        >
          <LinkIcon style={{ width: 14, height: 14 }} className="flex-shrink-0" />
          {linkLabel}
        </a>
      ) : null}
      {children}
    </div>
  );
}
