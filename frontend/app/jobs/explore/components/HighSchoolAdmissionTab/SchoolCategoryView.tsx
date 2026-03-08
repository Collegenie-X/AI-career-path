'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Home, BookOpen, Brain, Dumbbell, Target, Clock } from 'lucide-react';
import type { HighSchoolCategory, HighSchoolDetail } from '../../types';
import { CategoryTraitDetailDialog } from './CategoryTraitDetailDialog';

type SchoolCategoryViewProps = {
  category: HighSchoolCategory;
  onBack: () => void;
  onSelectSchool: (school: HighSchoolDetail) => void;
};

export const TRAIT_ITEMS = [
  { key: 'aptitude' as const, icon: <Brain className="w-3.5 h-3.5" />, label: '🧠 적성', emoji: '🧠' },
  { key: 'studyStyle' as const, icon: <BookOpen className="w-3.5 h-3.5" />, label: '📖 공부 스타일', emoji: '📖' },
  { key: 'mentalStrength' as const, icon: <Dumbbell className="w-3.5 h-3.5" />, label: '💪 멘탈 강도', emoji: '💪' },
  { key: 'gradeRequirement' as const, icon: <Star className="w-3.5 h-3.5" />, label: '📊 내신 기준', emoji: '📊' },
  { key: 'aptitudeTest' as const, icon: <Target className="w-3.5 h-3.5" />, label: '🎯 적성 검사', emoji: '🎯' },
  { key: 'internalGradeStrategy' as const, icon: <Clock className="w-3.5 h-3.5" />, label: '📅 내신 전략', emoji: '📅' },
];

export function SchoolCategoryView({ category, onBack, onSelectSchool }: SchoolCategoryViewProps) {
  const [showTraitDetailDialog, setShowTraitDetailDialog] = useState(false);

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft className="w-4 h-4 text-gray-300" />
        </button>
        <div
          className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${category.bgColor} 0%, rgba(0,0,0,0.2) 100%)`,
            border: `1px solid ${category.color}50`,
          }}
        >
          <span className="text-2xl">{category.emoji}</span>
          <div>
            <p className="text-sm font-bold text-white">{category.name}</p>
            <p className="text-[10px]" style={{ color: category.color }}>{category.description}</p>
          </div>
        </div>
      </div>

      {/* 분류 특성 카드 — 특성 상세만 표시 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${category.color}25` }}
      >
        <div className="px-3 pt-3 pb-2">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: category.color }}>
            이 유형의 특성 상세
          </p>
          {/* 상위 3개만 표시 — 나머지는 상세 보기 다이얼로그에서 */}
          <div className="space-y-2.5">
            {TRAIT_ITEMS.slice(0, 3).map((item) => (
              <TraitRow
                key={item.key}
                emoji={item.emoji}
                label={item.label}
                value={category.categoryTraits[item.key]}
                color={category.color}
              />
            ))}
          </div>
        </div>

        {/* 상세 보기 — 다이얼로그 열기 (나머지 3개 특성 + 적성검사 + 환경체크) */}
        <button
          onClick={() => setShowTraitDetailDialog(true)}
          className="w-full py-2.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-all"
          style={{
            background: `${category.color}10`,
            borderTop: `1px solid ${category.color}20`,
            color: category.color,
          }}
        >
          🎮 상세 보기 + 적성 검사
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 특성 상세 다이얼로그 */}
      {showTraitDetailDialog && (
        <CategoryTraitDetailDialog
          category={category}
          onClose={() => setShowTraitDetailDialog(false)}
        />
      )}

      {/* 학교 목록 */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5" />
          {category.schools.length}개 학교 탐방 — 학교를 눌러 자세히 보세요
        </p>
        <div className="space-y-2">
          {category.schools.map((school) => (
            <SchoolListCard
              key={school.id}
              school={school}
              categoryColor={category.color}
              categoryBgColor={category.bgColor}
              onClick={() => onSelectSchool(school)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TraitRow({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className="flex items-center gap-1 flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded-lg"
        style={{ background: `${color}15` }}
      >
        <span className="text-[11px]">{emoji}</span>
        <span className="text-[10px] font-bold whitespace-nowrap" style={{ color }}>{label.replace(/^[^ ]+ /, '')}</span>
      </div>
      <p className="text-[11px] text-gray-300 leading-relaxed">{value}</p>
    </div>
  );
}

function SchoolListCard({
  school,
  categoryColor,
  categoryBgColor,
  onClick,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
  onClick: () => void;
}) {
  const hasDetailData = !!(school.realTalk || school.highlightStats || school.careerPathDetails);

  return (
    <button
      className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={onClick}
    >
      <div className="px-3 py-3 flex items-center gap-3">
        {/* 학교 아이콘 */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.1) 100%)`,
            border: `1.5px solid ${categoryColor}40`,
          }}
        >
          {school.emoji}
        </div>

        {/* 학교 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-white">{school.name}</span>
            {school.ibCertified && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}
              >
                🌐 IB인증
              </span>
            )}
            {school.dormitory && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}
              >
                🏠 기숙사
              </span>
            )}
            {hasDetailData && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: `${categoryColor}25`, color: categoryColor }}
              >
                ✨ 상세정보
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">📍 {school.location}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-2.5 h-2.5"
                  style={{
                    fill: i < school.difficulty ? categoryColor : 'transparent',
                    color: i < school.difficulty ? categoryColor : 'rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-500">연 {school.annualAdmission}명 모집</span>
          </div>
        </div>

        {/* 자세히 보기 — 한 줄 + 아이콘 */}
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl flex-shrink-0 whitespace-nowrap"
          style={{ background: `${categoryColor}20`, border: `1px solid ${categoryColor}40` }}
        >
          <span className="text-[10px] font-bold" style={{ color: categoryColor }}>자세히 보기</span>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: categoryColor }} />
        </div>
      </div>

      {/* 하이라이트 스탯 (있을 경우) */}
      {school.highlightStats && (
        <div
          className="mx-3 mb-2.5 grid grid-cols-4 gap-1 rounded-xl p-2"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {school.highlightStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span className="text-base">{stat.emoji}</span>
              <span className="text-[10px] font-bold text-white text-center leading-tight">{stat.value}</span>
              <span className="text-[9px] text-gray-500 text-center leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 대표 프로그램 미리보기 (하이라이트 없을 때) */}
      {!school.highlightStats && (
        <div className="px-3 pb-2.5 flex flex-wrap gap-1">
          {school.famousPrograms.slice(0, 3).map((prog) => (
            <span
              key={prog}
              className="text-[10px] px-2 py-0.5 rounded-full text-gray-300"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {prog}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
