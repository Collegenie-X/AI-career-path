'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_ITEMS_PER_PAGE = 10;

type ListPaginationProps = {
  readonly totalItems: number;
  readonly currentPage: number;
  readonly itemsPerPage?: number;
  readonly onPageChange: (page: number) => void;
};

function formatLabel(template: string, values: Record<string, number>): string {
  return Object.entries(values).reduce(
    (acc, [key, value]) => acc.replace(`{{${key}}}`, String(value)),
    template,
  );
}

export function ListPagination({
  totalItems,
  currentPage,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
  onPageChange,
}: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const start = (safePage - 1) * itemsPerPage + 1;
  const end = Math.min(safePage * itemsPerPage, totalItems);

  if (totalItems <= itemsPerPage) return null;

  const pageInfo = formatLabel('{{current}} / {{total}} 페이지', { current: safePage, total: totalPages });
  const itemsInfo = formatLabel('{{start}}-{{end}} / {{total}}개', { start, end, total: totalItems });

  return (
    <div
      className="flex items-center justify-between gap-3 pt-3 mt-3"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="text-sm text-gray-500">{itemsInfo}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="h-8 px-3 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: safePage <= 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          이전
        </button>
        <span className="text-sm font-semibold text-gray-400 min-w-[80px] text-center">{pageInfo}</span>
        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="h-8 px-3 rounded-lg text-sm font-semibold flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: safePage >= totalPages ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          다음
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
