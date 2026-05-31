'use client';

import { motion } from 'framer-motion';
import { Camera, FileText, Sparkles, Plus, ChevronRight } from 'lucide-react';
import type { SharedRoadmap } from '../types';
import { buildPortfolioReport } from '../utils/buildPortfolioReport';
import { DREAM_ITEM_TYPES } from '../config';

const PERIOD_LABEL: Record<string, string> = {
  afterschool: '방과후',
  vacation: '방학',
  semester: '학기중',
};

interface PortfolioTabProps {
  myRoadmaps: SharedRoadmap[];
  allowMutations: boolean;
  onOpenReport: (roadmap: SharedRoadmap) => void;
  onCreateRoadmap: () => void;
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {myRoadmaps.map((roadmap) => {
          const report = buildPortfolioReport(roadmap);
          const typeMeta = DREAM_ITEM_TYPES.find((t) => t.value === report.type);
          const accent = report.starColor || typeMeta?.color || '#6C5CE7';
          const cover = report.photos[0]?.src;

          return (
            <motion.button
              key={roadmap.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onOpenReport(roadmap)}
              className="text-left rounded-2xl overflow-hidden flex flex-col"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* 커버 */}
              <div className="relative h-24 w-full overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}55, ${accent}22)` }}>
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl opacity-80">{typeMeta?.emoji ?? '🚀'}</div>
                )}
                <span
                  className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                >
                  {typeMeta?.emoji} {typeMeta?.label}
                </span>
              </div>

              {/* 본문 */}
              <div className="p-3.5 flex-1 flex flex-col">
                <div className="text-[13px] font-bold text-white leading-snug line-clamp-2">{roadmap.title}</div>
                <div className="mt-1 text-[10px] text-gray-500">{PERIOD_LABEL[report.period] ?? report.period}</div>

                {/* 진행률 */}
                <div className="mt-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">진행률</span>
                    <span className="text-[10px] font-bold" style={{ color: accent }}>{report.progress.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${report.progress.pct}%`, backgroundColor: accent }} />
                  </div>
                </div>

                {/* 결과 자산 카운트 */}
                <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
                  <span className="inline-flex items-center gap-1"><Camera className="w-3 h-3" /> 사진 {report.photos.length}</span>
                  <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> 산출물 {report.collectedOutputs.length}</span>
                  <span className="ml-auto inline-flex items-center gap-0.5 font-semibold" style={{ color: accent }}>
                    리포트 <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {!report.hasAnyResultAsset && (
                  <p className="mt-2 text-[10px] text-gray-600">결과물·사진을 기록하면 리포트가 채워져요</p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
