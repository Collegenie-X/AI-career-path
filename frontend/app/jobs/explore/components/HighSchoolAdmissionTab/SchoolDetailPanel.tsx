'use client';

import { useState } from 'react';
import {
  X, Star, MapPin, Users, BookOpen, Lightbulb, TrendingUp,
  CheckCircle, XCircle, Clock, Heart, MessageCircle, Calendar,
  Zap, Shield, Coffee, Target,
} from 'lucide-react';
import type { HighSchoolDetail } from '../../types';
import { SchoolSelectionInsightSection } from './SchoolSelectionInsightSection';
import { SchoolCommentSharePanel } from './SchoolCommentSharePanel';

type SchoolDetailPanelProps = {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
  onClose: () => void;
};

type DetailTabId = 'intro' | 'roadmap' | 'reallife';

const DETAIL_TABS: { id: DetailTabId; label: string; emoji: string }[] = [
  { id: 'intro', label: '학교·입시', emoji: '🏫' },
  { id: 'roadmap', label: '로드맵·팁', emoji: '🗓️' },
  { id: 'reallife', label: '솔직 후기', emoji: '💬' },
];

/**
 * 웹 2-컬럼 레이아웃용 학교 상세 패널
 */
export function SchoolDetailPanel({ school, categoryColor, categoryBgColor, onClose }: SchoolDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>('intro');

  return (
    <div
      className="flex flex-col h-full"
      style={{ animation: 'panel-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
    >
      {/* 헤더 */}
      <div
        className="flex-shrink-0 px-5 py-4 min-w-0 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${categoryColor}28, ${categoryColor}0a)`,
          borderBottom: `1px solid ${categoryColor}30`,
        }}
      >
        {/* 배경 글로우 */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${categoryColor}, transparent)`,
            animation: 'nebula-drift 8s ease-in-out infinite',
          }}
        />

        {/* 학교 기본 정보 */}
        <div className="flex items-start justify-between gap-3 mb-3 min-w-0 relative z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.2) 100%)`,
                border: `2px solid ${categoryColor}60`,
                boxShadow: `0 0 20px ${categoryColor}30`,
                animation: 'icon-float 3s ease-in-out infinite',
              }}
            >
              {school.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold text-white break-words">{school.name}</h2>
                {school.ibCertified && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.25)', color: '#10b981' }}>
                    🌐 IB인증
                  </span>
                )}
                {school.dormitory && (
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                    🏠 기숙사
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-[12px] text-gray-400">{school.location}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5"
                      style={{
                        fill: i < school.difficulty ? categoryColor : 'transparent',
                        color: i < school.difficulty ? categoryColor : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-gray-400">입학 난이도</span>
                <span className="text-[12px] text-gray-600">|</span>
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-[12px] text-gray-400">연 {school.annualAdmission}명</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/15 hover:rotate-90 relative z-10"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* 탭 바 */}
        <div
          className="flex gap-1 rounded-xl p-1 mb-0 min-w-0 relative z-10"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2.5 rounded-lg font-semibold transition-all flex flex-col items-center gap-0.5"
              style={{
                background: activeTab === tab.id ? `${categoryColor}40` : 'transparent',
                color: activeTab === tab.id ? categoryColor : '#6b7280',
                boxShadow: activeTab === tab.id ? `0 2px 8px ${categoryColor}30` : 'none',
              }}
            >
              <span className="text-base">{tab.emoji}</span>
              <span className="text-[12px] leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 — 스크롤 영역 */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 min-w-0"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeTab === 'intro' && (
          <>
            <OverviewTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
            <AdmissionTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
          </>
        )}
        {activeTab === 'roadmap' && (
          <>
            <CareerPathTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
            <SurvivalTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
          </>
        )}
        {activeTab === 'reallife' && (
          <RealLifeTab school={school} categoryColor={categoryColor} categoryBgColor={categoryBgColor} />
        )}
      </div>
    </div>
  );
}

// ── 탭 컨텐츠 컴포넌트들 (기존 SchoolDetailModal에서 복사) ──

function OverviewTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  return (
    <div className="px-5 py-4 space-y-3">
      <div
        className="rounded-2xl p-4"
        style={{
          background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.3) 100%)`,
          border: `1px solid ${categoryColor}30`,
        }}
      >
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: categoryColor }}>
          🏫 학교 소개
        </p>
        <p className="text-[12px] text-gray-200 leading-relaxed">{school.description}</p>
      </div>

      {school.teachingMethod && (
        <InfoBlock
          icon={<BookOpen className="w-4 h-4" />}
          title="교육 방식"
          content={school.teachingMethod}
          color={categoryColor}
        />
      )}

      {school.famousPrograms && school.famousPrograms.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            대표 프로그램
          </p>
          <div className="flex flex-wrap gap-1.5">
            {school.famousPrograms.map((prog, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-1 rounded-full font-semibold"
                style={{ background: `${categoryColor}20`, color: categoryColor }}
              >
                {prog}
              </span>
            ))}
          </div>
        </div>
      )}

      {school.futureOutlook && (
        <InfoBlock
          icon={<TrendingUp className="w-4 h-4" />}
          title="미래 전망"
          content={school.futureOutlook}
          color={categoryColor}
        />
      )}
    </div>
  );
}

function AdmissionTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  const admissionProcess = school.admissionProcess;
  const isArrayProcess = Array.isArray(admissionProcess);

  return (
    <div className="px-5 py-4 space-y-3">
      {/* 입시 전형 */}
      <div
        className="rounded-2xl p-3"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          입학 전형
        </p>
        {isArrayProcess ? (
          <div className="space-y-2">
            {admissionProcess.map((step: { step: string; title: string; detail: string; icon: string }, i: number) => (
              <div
                key={step.step}
                className="flex items-start gap-2.5 p-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: categoryBgColor, border: `1px solid ${categoryColor}40` }}
                >
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-white">{step.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-gray-200 leading-relaxed">{admissionProcess}</p>
        )}
      </div>

      {school.keyActivities && Object.keys(school.keyActivities).length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            핵심 활동 비중
          </p>
          <div className="space-y-1.5">
            {Object.entries(school.keyActivities).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[12px] text-gray-400 flex-1">{key}</span>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${value}%`,
                      background: categoryColor,
                      boxShadow: `0 0 6px ${categoryColor}`,
                    }}
                  />
                </div>
                <span className="text-[12px] font-bold" style={{ color: categoryColor }}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {school.admissionTip && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(217,119,6,0.08) 100%)',
            border: '1px solid rgba(251,191,36,0.35)',
          }}
        >
          <p className="text-[11px] font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" />
            합격 전략 TIP
          </p>
          <p className="text-[12px] text-gray-200 leading-relaxed">{school.admissionTip}</p>
        </div>
      )}
    </div>
  );
}

function CareerPathTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  const hasDetails = !!school.careerPathDetails;
  const basicSteps = school.careerPath ? [
    { period: '중학교 1학년', content: school.careerPath.middle1, icon: '🌱' },
    { period: '중학교 2학년', content: school.careerPath.middle2, icon: '🌿' },
    { period: '중학교 3학년', content: school.careerPath.middle3, icon: '🌳' },
  ] : [];

  return (
    <div className="px-5 py-4 space-y-3">
      {/* 인트로 */}
      <div
        className="p-3 rounded-2xl"
        style={{ background: categoryBgColor, border: `1px solid ${categoryColor}30` }}
      >
        <p className="text-[12px] font-bold mb-1" style={{ color: categoryColor }}>
          🗓️ {school.name} 합격을 위한 3년 로드맵
        </p>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          중학교 3년 동안 무엇을 어떻게 준비해야 하는지 단계별로 알려드려요.
        </p>
      </div>

      {/* 상세 로드맵 */}
      {hasDetails && school.careerPathDetails ? (
        <div className="relative pl-0.5">
          <div
            className="absolute left-[22px] top-5 bottom-0 w-0.5 -translate-x-1/2"
            style={{
              backgroundColor: categoryColor,
              opacity: 0.5,
              boxShadow: `0 0 8px ${categoryColor}50`,
            }}
          />
          <div className="relative space-y-0">
            {school.careerPathDetails.map((step: { grade: string; icon: string; tasks: string[]; keyPoint: string }, i: number) => (
              <div key={step.grade} className="relative flex gap-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 z-10"
                    style={{
                      background: `${categoryColor}20`,
                      borderColor: categoryColor,
                      boxShadow: `0 0 12px ${categoryColor}50`,
                    }}
                  >
                    {step.icon}
                  </div>
                  {i < school.careerPathDetails!.length - 1 && (
                    <div
                      className="flex-1 w-0.5 min-h-8 mt-1"
                      style={{ backgroundColor: categoryColor, opacity: 0.4 }}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-8">
                  <span
                    className="inline-block px-3 py-1.5 rounded-full text-xs font-extrabold mb-2"
                    style={{
                      backgroundColor: `${categoryColor}15`,
                      color: categoryColor,
                      border: `1px solid ${categoryColor}40`,
                    }}
                  >
                    {step.grade}
                  </span>
                  <ul className="space-y-1 mb-3">
                    {step.tasks.map((task: string) => (
                      <li key={task} className="text-[12px] text-gray-300 leading-relaxed flex items-start gap-2">
                        <span className="text-gray-500 flex-shrink-0 mt-0.5">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                  <div
                    className="p-2.5 rounded-xl"
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      border: '1px solid rgba(251,191,36,0.3)',
                    }}
                  >
                    <p className="text-[11px] font-bold text-yellow-400 mb-0.5">💡 이 시기의 핵심</p>
                    <p className="text-[11px] text-gray-200 leading-relaxed">{step.keyPoint}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : basicSteps.length > 0 ? (
        <div className="space-y-2">
          {basicSteps.map((step) => (
            <div
              key={step.period}
              className="rounded-xl p-3"
              style={{
                background: `${categoryColor}08`,
                border: `1px solid ${categoryColor}20`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{step.icon}</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${categoryColor}30`, color: categoryColor }}
                >
                  {step.period}
                </span>
              </div>
              <p className="text-[12px] text-gray-300 leading-relaxed">{step.content}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SurvivalTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  return (
    <div className="px-5 py-4 space-y-3">
      {/* 일과표 */}
      {school.dailySchedule && school.dailySchedule.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            재학 중 하루 일과
          </p>
          <div className="space-y-1.5">
            {school.dailySchedule.map((item: { time: string; activity: string; emoji: string }) => (
              <div
                key={item.time}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                <span
                  className="text-[11px] font-bold flex-shrink-0 w-10"
                  style={{ color: categoryColor }}
                >
                  {item.time}
                </span>
                <span className="text-[11px] text-gray-300">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {school.pros && school.pros.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(22,163,74,0.06) 100%)',
            border: '1px solid rgba(34,197,94,0.3)',
          }}
        >
          <p className="text-[11px] font-bold text-green-400 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            장점
          </p>
          <ul className="space-y-1.5">
            {school.pros.map((pro, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-gray-200 leading-relaxed">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {school.cons && school.cons.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(185,28,28,0.06) 100%)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <p className="text-[11px] font-bold text-red-400 mb-2 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            단점
          </p>
          <ul className="space-y-1.5">
            {school.cons.map((con, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-gray-200 leading-relaxed">
                <span className="text-red-400 flex-shrink-0">✗</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {school.survivalTips && school.survivalTips.length > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            생존 팁
          </p>
          <div className="space-y-2">
            {school.survivalTips.map((tip: { emoji: string; tip: string } | string, i: number) => {
              const isObject = typeof tip === 'object' && tip !== null;
              const emoji = isObject ? tip.emoji : '▸';
              const text = isObject ? tip.tip : tip;
              
              return (
                <div
                  key={i}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${categoryColor}20`,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${categoryColor}15` }}
                  >
                    {emoji}
                  </div>
                  <p className="text-[12px] text-gray-200 leading-relaxed">{text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RealLifeTab({
  school,
  categoryColor,
  categoryBgColor,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
}) {
  if (!school.realTalk || school.realTalk.length === 0) {
    return (
      <div className="px-5 py-4 space-y-3">
        <div
          className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm font-bold text-white mb-1">솔직 후기 준비 중</p>
          <p className="text-[12px] text-gray-400">이 학교의 상세 후기를 준비 중이에요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-3">
      {/* 인트로 */}
      <div
        className="p-3 rounded-2xl"
        style={{ background: categoryBgColor, border: `1px solid ${categoryColor}30` }}
      >
        <p className="text-[12px] font-bold mb-1" style={{ color: categoryColor }}>
          💬 중학생 눈높이 솔직 후기
        </p>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          이 학교에 대한 솔직한 이야기를 들어보세요.
        </p>
      </div>

      {/* 솔직 후기 카드들 */}
      {school.realTalk.map((item: { emoji: string; title: string; content: string }, i: number) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="px-3 py-2.5 flex items-center gap-2"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <span className="text-xl">{item.emoji}</span>
            <p className="text-[12px] font-bold text-white">{item.title}</p>
          </div>
          <div className="px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[12px] text-gray-200 leading-relaxed">{item.content}</p>
          </div>
        </div>
      ))}

      {school.selectionInsights && (
        <SchoolSelectionInsightSection
          insights={school.selectionInsights}
          categoryColor={categoryColor}
        />
      )}

      {school.comments && school.comments.length > 0 && (
        <SchoolCommentSharePanel
          comments={school.comments}
          categoryColor={categoryColor}
        />
      )}
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  content,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[11px] font-bold text-gray-400 mb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      <p className="text-[12px] text-gray-300 leading-relaxed">{content}</p>
    </div>
  );
}
