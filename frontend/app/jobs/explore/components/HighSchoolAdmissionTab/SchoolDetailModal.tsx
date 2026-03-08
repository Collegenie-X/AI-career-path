'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Star, MapPin, Users, BookOpen, Lightbulb, TrendingUp,
  CheckCircle, XCircle, Clock, Heart, MessageCircle, Calendar,
  Zap, Shield, Coffee, Target,
} from 'lucide-react';
import type { HighSchoolDetail } from '../../types';

type SchoolDetailModalProps = {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
  onClose: () => void;
};

// 탭 3개로 통합: 학교소개+입시전략 / 합격로드맵+생존팁 / 솔직후기
type DetailTabId = 'intro' | 'roadmap' | 'reallife';

const DETAIL_TABS: { id: DetailTabId; label: string; emoji: string }[] = [
  { id: 'intro', label: '학교·입시', emoji: '🏫' },
  { id: 'roadmap', label: '로드맵·팁', emoji: '🗓️' },
  { id: 'reallife', label: '솔직 후기', emoji: '💬' },
];

export function SchoolDetailModal({ school, categoryColor, categoryBgColor, onClose }: SchoolDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTabId>('intro');
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const modalContent = (
    <div
      className="fixed top-0 left-0 w-screen z-[9999] flex flex-col overflow-x-hidden"
      style={{
        background: 'rgba(0,0,0,0.96)',
        backdropFilter: 'blur(12px)',
        height: '100dvh',
      }}
    >
      <div
        className="flex flex-col min-w-0 max-w-[480px] w-full mx-auto"
        style={{
          height: '100%',
          paddingTop: 20,
          paddingBottom: 20,
        }}
      >
      {/* 헤더 */}
      <div
        className="flex-shrink-0 px-4 pt-4 pb-0 min-w-0"
        style={{
          background: `linear-gradient(180deg, ${categoryBgColor} 0%, rgba(0,0,0,0) 100%)`,
          borderBottom: `1px solid ${categoryColor}25`,
        }}
      >
        {/* 학교 기본 정보 */}
        <div className="flex items-start justify-between gap-3 mb-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.2) 100%)`,
                border: `2px solid ${categoryColor}60`,
                boxShadow: `0 0 20px ${categoryColor}30`,
              }}
            >
              {school.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold text-white break-words">{school.name}</h2>
                {school.ibCertified && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.25)', color: '#10b981' }}>
                    🌐 IB인증
                  </span>
                )}
                {school.dormitory && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                    🏠 기숙사
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span className="text-[11px] text-gray-400">{school.location}</span>
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
                <span className="text-[10px] text-gray-400">입학 난이도</span>
                <span className="text-[10px] text-gray-600">|</span>
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">연 {school.annualAdmission}명</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* 탭 바 — 3개 균등 분할 */}
        <div
          className="flex gap-1 rounded-xl p-1 mb-0 min-w-0"
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
              <span className="leading-tight text-center text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 — 상하 고정 요소와 겹치지 않도록 마진 확보 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3 min-w-0" style={{ paddingBottom: 32 }}>
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
    </div>
  );

  if (!portalTarget) return null;
  return createPortal(modalContent, portalTarget);
}

// ── 학교 소개 탭 ──────────────────────────────────────────────

function OverviewTab({ school, categoryColor, categoryBgColor }: TabProps) {
  return (
    <div className="space-y-3">
      {/* 하이라이트 스탯 */}
      {school.highlightStats && (
        <div
          className="rounded-2xl p-3"
          style={{ background: categoryBgColor, border: `1px solid ${categoryColor}30` }}
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">핵심 수치</p>
          <div className="grid grid-cols-2 gap-2">
            {school.highlightStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <span className="text-xl">{stat.emoji}</span>
                <span className="text-[11px] font-bold text-white text-center leading-tight">{stat.value}</span>
                <span className="text-[9px] text-gray-400 text-center leading-tight">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 특수 인증 */}
      <SectionCard title="학교 특징 & 인증" icon="🏅" color={categoryColor}>
        <p className="text-[12px] font-semibold text-white mb-2">{school.specialCertification}</p>
        <div className="flex flex-wrap gap-1.5">
          <InfoBadge label={school.dormitory ? '🏠 기숙사 있음' : '🏠 기숙사 없음'} color={school.dormitory ? '#fbbf24' : '#6b7280'} />
          <InfoBadge label={school.ibCertified ? '🌐 IB 인증' : '📚 일반 교육과정'} color={school.ibCertified ? '#10b981' : '#6b7280'} />
          <InfoBadge label={`💰 ${school.tuition}`} color={categoryColor} />
        </div>
      </SectionCard>

      {/* 수업 방식 */}
      <SectionCard title="어떻게 수업해요?" icon="📖" color={categoryColor}>
        <p className="text-[12px] text-gray-200 leading-relaxed">{school.teachingMethod}</p>
        {school.competitionLevel && (
          <div
            className="mt-2 flex items-center gap-2 p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: categoryColor }} />
            <div>
              <span className="text-[10px] font-bold" style={{ color: categoryColor }}>경쟁 수준: </span>
              <span className="text-[11px] text-gray-300">{school.competitionLevel}</span>
            </div>
          </div>
        )}
        {school.studyHoursPerDay && (
          <div
            className="mt-1.5 flex items-center gap-2 p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: categoryColor }} />
            <div>
              <span className="text-[10px] font-bold" style={{ color: categoryColor }}>하루 공부 시간: </span>
              <span className="text-[11px] text-gray-300">{school.studyHoursPerDay}</span>
            </div>
          </div>
        )}
        {school.selfStudyRatio && (
          <div
            className="mt-1.5 flex items-center gap-2 p-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" style={{ color: categoryColor }} />
            <div>
              <span className="text-[10px] font-bold" style={{ color: categoryColor }}>자기주도 비율: </span>
              <span className="text-[11px] text-gray-300">{school.selfStudyRatio}</span>
            </div>
          </div>
        )}
      </SectionCard>

      {/* 유명 프로그램 */}
      {school.famousProgramDetails ? (
        <SectionCard title="유명 프로그램 상세" icon="⭐" color={categoryColor}>
          <div className="space-y-2">
            {school.famousProgramDetails.map((prog) => (
              <div
                key={prog.name}
                className="p-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{prog.emoji}</span>
                  <span className="text-[12px] font-bold text-white">{prog.name}</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{prog.description}</p>
                <div
                  className="mt-1.5 flex items-center gap-1.5 px-2 py-1 rounded-lg"
                  style={{ background: `${categoryColor}15` }}
                >
                  <Zap className="w-3 h-3 flex-shrink-0" style={{ color: categoryColor }} />
                  <span className="text-[10px] font-semibold" style={{ color: categoryColor }}>{prog.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="유명 프로그램" icon="⭐" color={categoryColor}>
          <div className="space-y-1.5">
            {school.famousPrograms.map((prog, i) => (
              <div key={prog} className="flex items-center gap-2 p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span
                  className="text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${categoryColor}30`, color: categoryColor }}
                >
                  {i + 1}
                </span>
                <span className="text-[12px] text-gray-200">{prog}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* 재학생 수준 */}
      <SectionCard title="함께 공부하는 친구들 수준" icon="👥" color={categoryColor}>
        <p className="text-[12px] text-gray-200 leading-relaxed">{school.studentLevel}</p>
        {school.socialLife && (
          <div
            className="mt-2 p-2 rounded-xl flex items-start gap-2"
            style={{ background: `${categoryColor}10` }}
          >
            <Coffee className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: categoryColor }} />
            <p className="text-[11px] text-gray-300 leading-relaxed">{school.socialLife}</p>
          </div>
        )}
      </SectionCard>

      {/* 장단점 */}
      <div className="grid grid-cols-1 gap-2">
        <div className="p-3 rounded-2xl space-y-1.5"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <p className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> 이런 점이 좋아요
          </p>
          {school.pros.map((pro) => (
            <div key={pro} className="flex items-start gap-1">
              <span className="text-emerald-400 text-[11px] flex-shrink-0 mt-0.5">✓</span>
              <p className="text-[10px] text-gray-300 leading-relaxed">{pro}</p>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-2xl space-y-1.5"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p className="text-[10px] font-bold text-red-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> 이런 점은 힘들어요
          </p>
          {school.cons.map((con) => (
            <div key={con} className="flex items-start gap-1">
              <span className="text-red-400 text-[11px] flex-shrink-0 mt-0.5">!</span>
              <p className="text-[10px] text-gray-300 leading-relaxed">{con}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 목표 대학 & 진로 */}
      <SectionCard title="졸업 후 주로 어디로 가나요?" icon="🎓" color={categoryColor}>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {school.targetUniversities.map((uni) => (
            <span key={uni} className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
              style={{ background: `${categoryColor}20`, color: categoryColor }}>
              {uni}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {school.alumniCareers.map((career) => (
            <span key={career} className="text-[10px] px-2 py-0.5 rounded-full text-gray-300"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              {career}
            </span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── 입시 전략 탭 ──────────────────────────────────────────────

function AdmissionTab({ school, categoryColor, categoryBgColor }: TabProps) {
  return (
    <div className="space-y-3">
      {/* 입시 전형 단계 */}
      <SectionCard title="입시 전형 단계별 가이드" icon="📋" color={categoryColor}>
        <div className="space-y-2">
          {school.admissionProcess.map((step, i) => (
            <div
              key={step.step}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: categoryBgColor, border: `1px solid ${categoryColor}40` }}
                >
                  {step.icon}
                </div>
                {i < school.admissionProcess.length - 1 && (
                  <div className="w-0.5 h-3" style={{ background: `${categoryColor}30` }} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-white">{step.title}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 합격 전략 TIP */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
      >
        <p className="text-[12px] font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4" /> 합격 전략 핵심 TIP
        </p>
        <p className="text-[12px] text-gray-200 leading-relaxed">{school.admissionTip}</p>
      </div>

      {/* 내신 전략 */}
      <div
        className="p-3 rounded-2xl space-y-2"
        style={{ background: `${categoryColor}10`, border: `1px solid ${categoryColor}25` }}
      >
        <p className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: categoryColor }}>
          <TrendingUp className="w-3.5 h-3.5" /> 중학교 내신 전략
        </p>
        <div className="space-y-1.5">
          {[
            { emoji: '📊', label: '필요 내신', value: school.competitionLevel ?? '상위권 내신 필수' },
            { emoji: '📚', label: '하루 공부', value: school.studyHoursPerDay ?? '충분한 학습 시간 필요' },
            { emoji: '🧠', label: '자기주도', value: school.selfStudyRatio ?? '자기주도 학습 중요' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">{item.emoji}</span>
              <span className="text-[10px] font-bold text-gray-400 w-16 flex-shrink-0">{item.label}</span>
              <span className="text-[11px] text-gray-200">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 멘탈 건강 노트 */}
      {school.mentalHealthNote && (
        <div
          className="p-3 rounded-2xl"
          style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)' }}
        >
          <p className="text-[11px] font-bold text-purple-400 mb-1.5 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" /> 멘탈 건강 체크
          </p>
          <p className="text-[11px] text-gray-300 leading-relaxed">{school.mentalHealthNote}</p>
        </div>
      )}
    </div>
  );
}

// ── 합격 로드맵 탭 ────────────────────────────────────────────

function CareerPathTab({ school, categoryColor, categoryBgColor }: TabProps) {
  const hasDetails = !!school.careerPathDetails;

  const basicSteps = [
    { period: '중학교 1학년', content: school.careerPath.middle1, icon: '🌱' },
    { period: '중학교 2학년', content: school.careerPath.middle2, icon: '🌿' },
    { period: '중학교 3학년', content: school.careerPath.middle3, icon: '🌳' },
  ];

  return (
    <div className="space-y-3">
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
          지금 몇 학년인지 확인하고 시작하세요!
        </p>
      </div>

      {/* 상세 로드맵 (있을 경우) */}
      {hasDetails && school.careerPathDetails ? (
        <div className="space-y-3">
          {school.careerPathDetails.map((step, i) => (
            <div key={step.grade} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: categoryBgColor, border: `2px solid ${categoryColor}` }}
                >
                  {step.icon}
                </div>
                {i < school.careerPathDetails!.length - 1 && (
                  <div className="w-0.5 mt-1" style={{ background: `${categoryColor}30`, minHeight: 24 }} />
                )}
              </div>
              <div
                className="flex-1 rounded-2xl overflow-hidden mb-3"
                style={{ border: `1px solid ${categoryColor}25` }}
              >
                <div
                  className="px-3 py-2"
                  style={{ background: `${categoryColor}15` }}
                >
                  <p className="text-[12px] font-bold" style={{ color: categoryColor }}>{step.grade}</p>
                </div>
                <div className="px-3 py-2.5 space-y-1.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {step.tasks.map((task) => (
                    <div key={task} className="flex items-start gap-2">
                      <span className="text-[11px] flex-shrink-0 mt-0.5" style={{ color: categoryColor }}>▸</span>
                      <p className="text-[11px] text-gray-200 leading-relaxed">{task}</p>
                    </div>
                  ))}
                  <div
                    className="mt-2 p-2 rounded-xl"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
                  >
                    <p className="text-[10px] font-bold text-yellow-400 mb-0.5">💡 이 시기의 핵심</p>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{step.keyPoint}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {basicSteps.map((step, i) => (
            <div key={step.period} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: categoryBgColor, border: `2px solid ${categoryColor}` }}
                >
                  {step.icon}
                </div>
                {i < basicSteps.length - 1 && (
                  <div className="w-0.5 flex-1 mt-1" style={{ background: `${categoryColor}30`, minHeight: 20 }} />
                )}
              </div>
              <div
                className="flex-1 p-2.5 rounded-xl mb-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-[11px] font-bold mb-1" style={{ color: categoryColor }}>{step.period}</p>
                <p className="text-[12px] text-gray-200 leading-relaxed">{step.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 일과표 */}
      {school.dailySchedule && (
        <SectionCard title="재학 중 하루 일과" icon="⏰" color={categoryColor}>
          <div className="space-y-1.5">
            {school.dailySchedule.map((item) => (
              <div
                key={item.time}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                <span
                  className="text-[10px] font-bold flex-shrink-0 w-10"
                  style={{ color: categoryColor }}
                >
                  {item.time}
                </span>
                <span className="text-[11px] text-gray-300">{item.activity}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ── 솔직 후기 탭 ──────────────────────────────────────────────

function RealLifeTab({ school, categoryColor, categoryBgColor }: TabProps) {
  if (!school.realTalk) {
    return (
      <div className="space-y-3">
        <div
          className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm font-bold text-white mb-1">솔직 후기 준비 중</p>
          <p className="text-[11px] text-gray-400">이 학교의 상세 후기를 준비 중이에요.</p>
        </div>
        <SchoolBasicLifeInfo school={school} categoryColor={categoryColor} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 인트로 */}
      <div
        className="p-3 rounded-2xl"
        style={{ background: categoryBgColor, border: `1px solid ${categoryColor}30` }}
      >
        <p className="text-[11px] font-bold mb-1" style={{ color: categoryColor }}>
          💬 중학생 눈높이 솔직 후기
        </p>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          이 학교에 대한 솔직한 이야기를 들어보세요. 좋은 점, 힘든 점, 어떤 학생에게 맞는지 알려드려요.
        </p>
      </div>

      {/* 솔직 후기 카드들 */}
      {school.realTalk.map((item, i) => (
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

      {/* 학교 생활 정보 */}
      <SchoolBasicLifeInfo school={school} categoryColor={categoryColor} />
    </div>
  );
}

function SchoolBasicLifeInfo({ school, categoryColor }: { school: HighSchoolDetail; categoryColor: string }) {
  return (
    <div
      className="p-3 rounded-2xl space-y-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[11px] font-bold text-gray-400">📋 학교 생활 기본 정보</p>
      {[
        { emoji: '🏠', label: '기숙사', value: school.dormitory ? '전원 기숙사 생활' : '통학 (기숙사 없음)' },
        { emoji: '💰', label: '학비', value: school.tuition },
        { emoji: '📚', label: '수업 방식', value: school.teachingMethod },
      ].map((item) => (
        <div key={item.label} className="flex items-start gap-2">
          <span className="text-base flex-shrink-0">{item.emoji}</span>
          <span className="text-[10px] font-bold text-gray-400 flex-shrink-0 w-12 mt-0.5">{item.label}</span>
          <span className="text-[11px] text-gray-300 leading-relaxed">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── 생존 팁 탭 ────────────────────────────────────────────────

function SurvivalTab({ school, categoryColor, categoryBgColor }: TabProps) {
  return (
    <div className="space-y-3">
      {/* 인트로 */}
      <div
        className="p-3 rounded-2xl"
        style={{ background: categoryBgColor, border: `1px solid ${categoryColor}30` }}
      >
        <p className="text-[12px] font-bold mb-1" style={{ color: categoryColor }}>
          🛡️ 이 학교에서 살아남는 법
        </p>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          엘리트 환경에서 성적만큼 중요한 것이 멘탈 관리예요. 선배들이 알려주는 생존 팁을 확인하세요!
        </p>
      </div>

      {/* 생존 팁 */}
      {school.survivalTips ? (
        <div className="space-y-2">
          {school.survivalTips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-2xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${categoryColor}20`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${categoryColor}15` }}
              >
                {tip.emoji}
              </div>
              <p className="text-[12px] text-gray-200 leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <p className="text-[11px] text-gray-400">생존 팁을 준비 중이에요.</p>
        </div>
      )}

      {/* 정체성 & 멘탈 관리 */}
      <div
        className="p-4 rounded-2xl space-y-3"
        style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}
      >
        <p className="text-[12px] font-bold text-purple-400 flex items-center gap-1.5">
          <Heart className="w-4 h-4" /> 공부 직진 속 나를 잃지 않는 법
        </p>
        {school.mentalHealthNote && (
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <p className="text-[11px] text-gray-300 leading-relaxed">{school.mentalHealthNote}</p>
          </div>
        )}
        <div className="space-y-2">
          {[
            { emoji: '🧘', tip: '하루 30분은 공부 외 자기만의 시간을 가지세요. 운동, 음악, 산책 무엇이든 좋아요.' },
            { emoji: '💬', tip: '힘들 때 혼자 버티지 마세요. 친구, 선생님, 부모님께 솔직하게 말하는 용기가 필요해요.' },
            { emoji: '🎯', tip: '왜 이 학교에 왔는지 기억하세요. 목표가 명확하면 힘든 순간도 버틸 수 있어요.' },
          ].map((item) => (
            <div key={item.tip} className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">{item.emoji}</span>
              <p className="text-[11px] text-gray-300 leading-relaxed">{item.tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 이 학교가 맞는 학생 체크리스트 */}
      <div
        className="p-3 rounded-2xl"
        style={{ background: `${categoryColor}10`, border: `1px solid ${categoryColor}25` }}
      >
        <p className="text-[11px] font-bold mb-2" style={{ color: categoryColor }}>
          <MessageCircle className="w-3.5 h-3.5 inline mr-1" />
          이 학교가 맞는 학생 체크리스트
        </p>
        <div className="space-y-1.5">
          {[
            `${school.studentLevel}에 해당하는 학생`,
            school.dormitory ? '기숙사 생활에 적응할 수 있는 학생' : '통학하며 자기 관리가 가능한 학생',
            school.ibCertified ? 'IB 과정의 에세이·토론 방식 수업을 즐기는 학생' : '해당 학교의 수업 방식에 관심 있는 학생',
            '목표 의식이 명확하고 자기주도 학습이 가능한 학생',
          ].map((check) => (
            <div key={check} className="flex items-start gap-2">
              <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: categoryColor }} />
              <p className="text-[11px] text-gray-300 leading-relaxed">{check}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 일과표 요약 */}
      {school.dailySchedule && (
        <SectionCard title="재학 중 하루 일과 미리보기" icon="⏰" color={categoryColor}>
          <div className="grid grid-cols-1 gap-1.5">
            {school.dailySchedule.slice(0, 6).map((item) => (
              <div
                key={item.time}
                className="flex items-center gap-1.5 p-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-sm">{item.emoji}</span>
                <div>
                  <p className="text-[9px] font-bold" style={{ color: categoryColor }}>{item.time}</p>
                  <p className="text-[10px] text-gray-300 leading-tight">{item.activity}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ── 공통 컴포넌트 ─────────────────────────────────────────────

type TabProps = {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
};

function SectionCard({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-3 space-y-2"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-[11px] font-bold flex items-center gap-1.5" style={{ color }}>
        <span>{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

function InfoBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color }}
    >
      {label}
    </span>
  );
}
