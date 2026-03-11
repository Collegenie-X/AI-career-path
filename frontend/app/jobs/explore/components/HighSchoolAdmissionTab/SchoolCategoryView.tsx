'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, BookOpen, Brain, Dumbbell, Star, Target, Clock } from 'lucide-react';
import type { HighSchoolCategory, HighSchoolDetail } from '../../types';
import { CategoryTraitDetailDialog } from './CategoryTraitDetailDialog';
import { HIGH_SCHOOL_LABELS } from '../../config';

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
    <div className="space-y-4">
      {/* ── 상단: 헤더 + 특성 카드 (강조) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl min-h-[72px]"
            style={{
              background: `linear-gradient(135deg, ${category.bgColor} 0%, ${category.color}18 50%, rgba(0,0,0,0.15) 100%)`,
              border: `2px solid ${category.color}55`,
              boxShadow: `0 4px 20px ${category.color}25`,
            }}
          >
            <span className="text-3xl flex-shrink-0">{category.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-white leading-tight">{category.name}</p>
              <p className="text-xs mt-1 leading-snug" style={{ color: category.color }}>{category.description}</p>
            </div>
          </div>
        </div>

        {/* 분류 특성 카드 — 상단 강조 */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${category.color}35`,
            boxShadow: `0 2px 12px ${category.color}15`,
          }}
        >
          <div className="px-4 pt-4 pb-3">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: category.color }}>
              {HIGH_SCHOOL_LABELS.school_trait_detail_title}
            </p>
          <div className="space-y-3">
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

        <button
          onClick={() => setShowTraitDetailDialog(true)}
          className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.99]"
          style={{
            background: `${category.color}18`,
            borderTop: `1.5px solid ${category.color}30`,
            color: category.color,
          }}
        >
          {HIGH_SCHOOL_LABELS.school_trait_detail_button}
          <ChevronRight className="w-4 h-4" />
        </button>
        </div>
      </div>

      {/* 특성 상세 다이얼로그 */}
      {showTraitDetailDialog && (
        <CategoryTraitDetailDialog
          category={category}
          onClose={() => setShowTraitDetailDialog(false)}
        />
      )}

      {/* ── 학교 목록 (단순화) ── */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          {category.schools.length}{HIGH_SCHOOL_LABELS.school_list_section_title} · {HIGH_SCHOOL_LABELS.school_list_click_hint}
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

function DifficultyDots({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i < level ? color : 'rgba(255,255,255,0.2)' }}
        />
      ))}
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
  const difficultyText = HIGH_SCHOOL_LABELS.school_difficulty_levels[String(school.difficulty)] ?? '';
  const shortDesc = school.teachingMethod.split(',')[0].trim();

  return (
    <button
      className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] group"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={onClick}
    >
      <div className="px-3 py-3 flex items-center gap-3">
        {/* 좌측: 학교 아이콘 */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, ${categoryColor}15 100%)`,
            border: `1.5px solid ${categoryColor}40`,
          }}
        >
          {school.emoji}
        </div>

        {/* 중앙: 학교 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-white truncate">{school.name}</span>
            {school.ibCertified && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                IB
              </span>
            )}
            {school.dormitory && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                🏠
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 line-clamp-1 mb-1">{shortDesc}</p>
          
          {/* 하단: 지역·난이도·정원 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500" />
              <span className="text-[10px] text-gray-500">{school.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DifficultyDots level={school.difficulty} color={categoryColor} />
              <span className="text-[10px] text-gray-500">{difficultyText}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500">👥 {school.annualAdmission}명</span>
            </div>
          </div>
        </div>

        {/* 우측: 화살표 버튼 */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}30, ${categoryColor}15)`,
            border: `1.5px solid ${categoryColor}50`,
          }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: categoryColor }} />
        </div>
      </div>

      {/* 하단: 대표 프로그램 미리보기 (3개) */}
      {school.famousPrograms && school.famousPrograms.length > 0 && (
        <div
          className="px-3 pb-2.5 flex flex-wrap gap-1.5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          {school.famousPrograms.slice(0, 3).map((prog, idx) => (
            <span
              key={idx}
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
