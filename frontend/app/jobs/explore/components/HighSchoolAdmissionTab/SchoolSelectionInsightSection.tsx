'use client';

import { BarChart3, CheckCircle2, Compass, GraduationCap, Users } from 'lucide-react';
import type { HighSchoolDetail } from '../../types';

type SchoolSelectionInsightSectionProps = {
  school: HighSchoolDetail;
  categoryColor: string;
  sectionMode: 'overview' | 'admission';
};

const ADMISSION_ROUTE_STRENGTH_LABELS = {
  high: '강점',
  medium: '보통',
  low: '보완 필요',
} as const;

const ADMISSION_ROUTE_STRENGTH_COLORS = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#ef4444',
} as const;

function SectionCard({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-3 space-y-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[12px] font-bold flex items-center gap-1.5" style={{ color }}>
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function HighSchoolOverviewInsight({
  school,
  categoryColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
}) {
  const selectionProfile = school.selectionProfile;
  if (!selectionProfile) return null;

  return (
    <SectionCard title="학교 특수성 요약" icon={<Compass className="w-3.5 h-3.5" />} color={categoryColor}>
      <div className="space-y-2">
        <p className="text-[12px] font-bold text-white">{selectionProfile.profileTitle}</p>
        <p className="text-[12px] text-gray-300 leading-relaxed">{selectionProfile.profileSummary}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-gray-400">📘 교과 특성</p>
        {selectionProfile.curriculumHighlights.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="text-[12px] mt-0.5" style={{ color: categoryColor }}>▸</span>
            <p className="text-[12px] text-gray-200 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[11px] font-bold text-gray-400 mb-1">🏃 특별활동 포인트</p>
          {selectionProfile.extracurricularHighlights.slice(0, 2).map((item) => (
            <p key={item} className="text-[12px] text-gray-300 leading-relaxed">
              - {item}
            </p>
          ))}
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[11px] font-bold text-gray-400 mb-1">👥 대표 동아리 결</p>
          <div className="flex flex-wrap gap-1.5">
            {selectionProfile.clubHighlights.map((club) => (
              <span
                key={club}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: `${categoryColor}20`, color: categoryColor }}
              >
                {club}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function HighSchoolAdmissionInsight({
  school,
  categoryColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
}) {
  const selectionProfile = school.selectionProfile;
  if (!selectionProfile) return null;

  const totalRatio = selectionProfile.majorUniversityRatios.reduce((sum, item) => sum + item.ratio, 0);
  const normalizedTotal = totalRatio === 0 ? 1 : totalRatio;

  return (
    <div className="space-y-3">
      <SectionCard title="진학 루트 강점 (유학·수시·정시)" icon={<GraduationCap className="w-3.5 h-3.5" />} color={categoryColor}>
        <div className="space-y-2">
          {selectionProfile.admissionRouteStrengths.map((routeStrength) => {
            const strengthColor = ADMISSION_ROUTE_STRENGTH_COLORS[routeStrength.strength];
            return (
              <div
                key={routeStrength.route}
                className="p-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-[12px] font-bold text-white">{routeStrength.route}</p>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: strengthColor, background: `${strengthColor}20` }}
                  >
                    {ADMISSION_ROUTE_STRENGTH_LABELS[routeStrength.strength]}
                  </span>
                </div>
                <p className="text-[12px] text-gray-300 leading-relaxed">{routeStrength.reason}</p>
                <p className="text-[12px] text-gray-400 mt-1">추천: {routeStrength.recommendedFor}</p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="주요 대학·진로 비율" icon={<BarChart3 className="w-3.5 h-3.5" />} color={categoryColor}>
        <div className="space-y-2">
          {selectionProfile.majorUniversityRatios.map((ratioItem) => {
            const normalizedRatio = Math.round((ratioItem.ratio / normalizedTotal) * 100);
            return (
              <div key={ratioItem.track} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] text-gray-200">{ratioItem.track}</p>
                  <p className="text-[12px] font-bold" style={{ color: categoryColor }}>{ratioItem.ratio}%</p>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${normalizedRatio}%`, background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}99)` }}
                  />
                </div>
                {ratioItem.note ? <p className="text-[12px] text-gray-500">{ratioItem.note}</p> : null}
              </div>
            );
          })}
          {selectionProfile.ratioBasisNote ? (
            <p className="text-[12px] text-gray-500 leading-relaxed mt-1">{selectionProfile.ratioBasisNote}</p>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="중학생 선택 체크리스트" icon={<Users className="w-3.5 h-3.5" />} color={categoryColor}>
        <div className="space-y-1.5">
          {selectionProfile.middleSchoolSelectionChecklist.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: categoryColor }} />
              <p className="text-[12px] text-gray-300 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function SchoolSelectionInsightSection({
  school,
  categoryColor,
  sectionMode,
}: SchoolSelectionInsightSectionProps) {
  if (!school.selectionProfile) return null;

  if (sectionMode === 'overview') {
    return <HighSchoolOverviewInsight school={school} categoryColor={categoryColor} />;
  }

  return <HighSchoolAdmissionInsight school={school} categoryColor={categoryColor} />;
}
