'use client';

import { Camera, FileText, Sparkles, Plus, ChevronRight } from 'lucide-react';
import type { SharedRoadmap } from '../types';
import { buildPortfolioReport } from '../utils/buildPortfolioReport';
import { DREAM_ITEM_TYPES } from '../config';

const PERIOD_LABEL: Record<string, string> = {
  afterschool: '방과후',
  vacation: '방학',
  semester: '학기중',
};

const PERIOD_LABEL_COLORS: Record<string, string> = {
  afterschool: '#F59E0B',
  vacation: '#22C55E',
  semester: '#3B82F6',
};

interface PortfolioTabProps {
  myRoadmaps: SharedRoadmap[];
  allowMutations: boolean;
  onOpenReport: (roadmap: SharedRoadmap) => void;
  onCreateRoadmap: () => void;
}

/** 진행률 → 상태 배지(라벨·색상) */
function getPortfolioStatus(pct: number): { label: string; color: string } {
  if (pct >= 100) return { label: '완료', color: '#34d399' };
  if (pct > 0) return { label: '진행 중', color: '#fbbf24' };
  return { label: '시작 전', color: '#94a3b8' };
}

export function PortfolioTab({ myRoadmaps, allowMutations, onOpenReport, onCreateRoadmap }: PortfolioTabProps) {
  if (myRoadmaps.length === 0) {
    return (
      <div
        className="rounded-2xl px-6 py-12 text-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}
      >
        <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: '#ec4899' }} />
        <p className="text-sm font-bold text-white">아직 포트폴리오에 담을 실행이 없어요</p>
        <p className="text-[12px] text-gray-400 mt-1.5 leading-relaxed">
          실행계획을 만들면 주차별 산출물과 사진이 자동으로 모여<br />결과 리포트가 됩니다.
        </p>
        {allowMutations && (
          <button
            onClick={onCreateRoadmap}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <Plus className="w-3.5 h-3.5" /> 실행계획 만들기
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-gray-400 px-0.5">
        실행한 계획이 곧 포트폴리오입니다. 카드를 눌러 <span className="text-white font-semibold">결과 리포트</span>를 확인하고 결과물·사진을 정리하세요.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {myRoadmaps.map((roadmap) => {
          const report = buildPortfolioReport(roadmap);
          const typeMeta = DREAM_ITEM_TYPES.find((t) => t.value === report.type);
          const accent = report.starColor || typeMeta?.color || '#6C5CE7';
          const periodColor = PERIOD_LABEL_COLORS[report.period] ?? '#6B7280';
          const status = getPortfolioStatus(report.progress.pct);
          const thumb = report.photos[0]?.src;
          const descriptionPreview = (roadmap.description ?? '').trim().slice(0, 60);

          return (
            <button
              key={roadmap.id}
              type="button"
              onClick={() => onOpenReport(roadmap)}
              aria-label={`${roadmap.title} — 결과 리포트 보기`}
              className="group w-full rounded-xl border p-3.5 text-left transition-colors hover:bg-white/[0.05] active:scale-[0.995] flex flex-col"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              {/* ── 상단: 타입 타일 + 메타 배지 ── */}
              <div className="flex items-start gap-3 mb-2.5">
                <div
                  className="flex-shrink-0 flex h-10 w-10 items-center justify-center overflow-hidden text-xl leading-none"
                  style={{ backgroundColor: `${accent}22`, border: `1px solid ${accent}44`, borderRadius: '2px' }}
                >
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    typeMeta?.emoji ?? '🚀'
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  <span className="text-[11px] font-bold" style={{ color: accent }}>
                    {typeMeta?.label}
                  </span>
                  <span
                    className="px-1.5 py-0.5 text-[11px] font-bold"
                    style={{ borderRadius: '2px', backgroundColor: `${periodColor}18`, color: periodColor }}
                  >
                    {PERIOD_LABEL[report.period] ?? report.period}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold" style={{ color: status.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: status.color }} />
                    {status.label}
                  </span>
                </div>
              </div>

              {/* ── 제목 + 설명 ── */}
              <h4 className="mb-1 line-clamp-2 text-[14px] font-black leading-snug text-white flex-1">{roadmap.title}</h4>
              {descriptionPreview.length > 0 && (
                <p className="mb-2 line-clamp-1 text-[11px] leading-relaxed text-gray-500">{descriptionPreview}</p>
              )}

              {/* ── 진행률 막대 ── */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-500">진행률</span>
                  <span className="text-[11px] font-bold" style={{ color: accent }}>
                    {report.progress.done}/{report.progress.total} · {report.progress.pct}%
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${report.progress.pct}%`, backgroundColor: accent }}
                  />
                </div>
              </div>

              {/* ── 하단: 사진·산출물·화살표 ── */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5 mt-auto">
                <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-0.5">
                    <Camera className="h-3 w-3 text-sky-400/90" aria-hidden />
                    <span className="text-gray-500">사진</span>{' '}
                    <span className="font-semibold text-gray-300">{report.photos.length}</span>
                  </span>
                  <span className="text-white/20">|</span>
                  <span className="inline-flex items-center gap-0.5">
                    <FileText className="h-3 w-3 text-emerald-400/90" aria-hidden />
                    <span className="text-gray-500">산출물</span>{' '}
                    <span className="font-semibold text-gray-300">{report.collectedOutputs.length}</span>
                  </span>
                </div>
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center transition-colors group-hover:border-white/30"
                  style={{ border: '2px solid rgba(255,255,255,0.14)', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: '9999px' }}
                  aria-hidden
                >
                  <ChevronRight className="h-4 w-4 translate-x-px text-white/70 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
