'use client';

import { Map } from 'lucide-react';

type TwoColumnPanelLayoutProps = {
  /** 왼쪽 리스트 슬롯 */
  readonly listSlot: React.ReactNode;
  /** 오른쪽 상세 패널 슬롯 */
  readonly detailSlot: React.ReactNode;
  /** 선택된 항목이 있는지 여부 (모바일에서 패널 전환 여부 결정) */
  readonly hasSelection: boolean;
  /** 선택 해제 콜백 (모바일 뒤로가기) */
  readonly onClearSelection?: () => void;
  /** 선택 없을 때 패널에 표시할 플레이스홀더 텍스트 */
  readonly emptyPlaceholderText?: string;
  /** 선택 없을 때 패널에 표시할 플레이스홀더 서브텍스트 */
  readonly emptyPlaceholderSubText?: string;
};

function EmptyDetailPlaceholder({
  text,
  subText,
}: {
  readonly text: string;
  readonly subText: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-center px-6">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(108,92,231,0.06))',
          border: '1px solid rgba(108,92,231,0.25)',
        }}
      >
        <Map className="w-7 h-7" style={{ color: 'rgba(108,92,231,0.7)' }} />
      </div>
      <div>
        <p className="text-sm font-bold text-white/70">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{subText}</p>
      </div>
    </div>
  );
}

/**
 * 2-컬럼 마스터-디테일 레이아웃 래퍼
 *
 * - 모바일(< md): 리스트 또는 패널 중 하나만 표시 (hasSelection으로 전환)
 * - 데스크탑(md+): 왼쪽 리스트 + 오른쪽 패널 항상 나란히 표시
 */
export function TwoColumnPanelLayout({
  listSlot,
  detailSlot,
  hasSelection,
  onClearSelection,
  emptyPlaceholderText = '항목을 선택하세요',
  emptyPlaceholderSubText = '왼쪽 목록에서 항목을 클릭하면 상세 내용이 여기에 표시됩니다',
}: TwoColumnPanelLayoutProps) {
  return (
    <div className="flex gap-5 items-start">
      {/* ── 왼쪽: 리스트 (고정 너비) ── */}
      {/* 모바일: 선택 없을 때만 표시 / 데스크탑: 항상 표시 */}
      <div
        className={`md:w-[520px] md:flex-shrink-0 w-full ${hasSelection ? 'hidden md:block' : 'block'}`}
      >
        {listSlot}
      </div>

      {/* ── 오른쪽: 상세 패널 (나머지 공간 채움) ── */}
      {/* 모바일: 선택 있을 때만 표시 / 데스크탑: 항상 표시 */}
      <div
        className={`
          md:flex-1 md:min-w-0
          ${hasSelection ? 'block w-full' : 'hidden md:block'}
        `}
      >
        {/* 모바일 뒤로가기 버튼 */}
        {hasSelection && onClearSelection && (
          <button
            onClick={onClearSelection}
            className="md:hidden flex items-center gap-2 mb-3 text-sm font-semibold text-white/60 hover:text-white/90 transition-colors"
          >
            <span>←</span>
            <span>목록으로</span>
          </button>
        )}

        <div
          className="rounded-3xl border"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            overflow: 'clip',
          }}
        >
          {hasSelection ? (
            detailSlot
          ) : (
            <EmptyDetailPlaceholder
              text={emptyPlaceholderText}
              subText={emptyPlaceholderSubText}
            />
          )}
        </div>
      </div>
    </div>
  );
}
