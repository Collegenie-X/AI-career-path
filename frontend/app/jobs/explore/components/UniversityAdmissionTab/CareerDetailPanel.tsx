'use client';

import { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Rocket,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';

import careerDetailGuidanceData from '@/data/university-admission/career-detail-guidance.json';

export type CareerMajorCareer = {
  id: string;
  name: string;
  emoji: string;
  kingdom: string;
  targetMajor: string;
  admissionType: string;
  keySubjects: string[];
  setakExamples: Array<{
    subject: string;
    topic: string;
    description: string;
  }>;
  projectIdeas: string[];
  universities: string[];
  successStories?: Array<{
    profile: string;
    admissionType: string;
    keyActivities: string[];
    result: string;
  }>;
  universityDetails?: Array<{
    university: string;
    department: string;
    admissionTypes: Array<{
      type: string;
      competition: string;
      keyRequirements: string[];
    }>;
  }>;
  monthlyPreparation?: Array<{
    period: string;
    goal: string;
    tasks: string[];
  }>;
};

type AdmissionTypeStrategy = {
  coreStrategies: string[];
  evidenceChecklist: string[];
  interviewFocus: string[];
};

type CareerDetailGuidance = {
  importantPoints: string[];
  cautions: string[];
  admissionsOfficerView: string[];
  kingdomGuidance?: Record<
    string,
    {
      importantPoints: string[];
      cautions: string[];
      admissionsOfficerView: string[];
      deepQa: Array<{ question: string; answer: string }>;
    }
  >;
  admissionTypeStrategies: Record<string, AdmissionTypeStrategy>;
  deepQa: Array<{
    question: string;
    answer: string;
  }>;
};

const careerDetailGuidance = careerDetailGuidanceData as CareerDetailGuidance;

function extractNormalizedKingdomLabel(kingdomValue: string): string {
  return kingdomValue.replace(/[^\u3131-\uD79D\s]/g, '').trim();
}

type CareerDetailPanelProps = {
  readonly career: CareerMajorCareer;
  readonly onClose: () => void;
};

/** 직업(과)별 대입 상세 — 마스터-디테일 오른쪽 패널 */
export function CareerDetailPanel({ career, onClose }: CareerDetailPanelProps) {

  const [activeTab, setActiveTab] = useState<'setak' | 'strategy' | 'universities' | 'qa'>('setak');
  const [expandedQaIndex, setExpandedQaIndex] = useState<number | null>(null);
  const [expandedSuccessIndex, setExpandedSuccessIndex] = useState<number | null>(null);
  const [expandedUnivIndex, setExpandedUnivIndex] = useState<number | null>(null);
  const [expandedMonthIndex, setExpandedMonthIndex] = useState<number | null>(null);
  const normalizedKingdomLabel = extractNormalizedKingdomLabel(career.kingdom);
  const selectedKingdomGuidance = careerDetailGuidance.kingdomGuidance?.[normalizedKingdomLabel];
  const mergedDeepQa = [
    ...(selectedKingdomGuidance?.deepQa ?? []),
    ...careerDetailGuidance.deepQa,
  ].slice(0, 20);
  const admissionTypeTokens = career.admissionType.split('+').map((typeLabel) => typeLabel.trim());
  const admissionTypeStrategyCards = admissionTypeTokens
    .map((typeLabel) => ({
      typeLabel,
      strategy: careerDetailGuidance.admissionTypeStrategies[typeLabel],
    }))
    .filter((item): item is { typeLabel: string; strategy: AdmissionTypeStrategy } => Boolean(item.strategy));

  return (
      <div
        className="w-full min-w-0 max-w-full max-h-[min(78vh,720px)] md:max-h-none overflow-y-auto overflow-x-hidden rounded-2xl pb-2"
        style={{
          background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.95) 100%)',
          border: '2px solid rgba(16,185,129,0.4)',
        }}
      >
        <div
          className="sticky top-0 z-10 p-4"
          style={{
            background: 'rgba(16,185,129,0.15)',
            borderBottom: '1px solid rgba(16,185,129,0.3)',
          }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{
                background: 'rgba(16,185,129,0.2)',
                border: '2px solid rgba(16,185,129,0.5)',
              }}
            >
              {career.emoji}
            </div>
            <div className="flex-1 min-w-0 break-words">
              <h2 className="text-lg font-bold text-white mb-1">{career.name}</h2>
              <p className="text-xs text-white/70 mb-1">{career.kingdom}</p>
              <p className="text-xs text-emerald-400 mb-2">{career.targetMajor}</p>
              
              <div className="flex flex-wrap gap-1.5">
                {career.successStories && career.successStories.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 flex items-center gap-1">
                    <Trophy className="w-2.5 h-2.5" />
                    합격사례 {career.successStories.length}개
                  </span>
                )}
                {career.universityDetails && career.universityDetails.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                    <GraduationCap className="w-2.5 h-2.5" />
                    대학정보 {career.universityDetails.length}개교
                  </span>
                )}
                {career.monthlyPreparation && career.monthlyPreparation.length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    준비일정 {career.monthlyPreparation.length}단계
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'setak' as const, label: '세특예시', icon: FileText },
              { id: 'strategy' as const, label: '입시전략', icon: Target },
              { id: 'universities' as const, label: '대학', icon: GraduationCap },
              { id: 'qa' as const, label: '심층Q&A', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: activeTab === tab.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${activeTab === tab.id ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {activeTab === 'setak' && (
            <>
              <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">핵심 교과</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {career.keySubjects.map((subject, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">세특 작성 예시</h4>
                </div>
                {career.setakExamples.map((example, index) => (
                  <div
                    key={index}
                    className="rounded-lg p-3"
                    style={{
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                        {example.subject}
                      </span>
                    </div>
                    <p className="text-sm text-white font-medium mb-1">{example.topic}</p>
                    <p className="text-xs text-white/70">{example.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-sm font-bold text-white">프로젝트 아이디어</h4>
                </div>
                <div className="space-y-2">
                  {career.projectIdeas.map((idea, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-xs text-white/80 p-2 rounded-lg bg-white/5"
                    >
                      <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-yellow-400 flex-shrink-0" />
                      <span>{idea}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-3">
              {/* 실전 합격 사례 */}
              {career.successStories && career.successStories.length > 0 && (
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.2) 100%)',
                    border: '1px solid rgba(251,191,36,0.35)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    <h4 className="text-sm font-bold text-white">실전 합격 사례</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-200 border border-yellow-300/40">
                      REAL CASE
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mb-3">실제 합격생들의 구체적인 준비 과정</p>

                  <div className="space-y-2">
                    {career.successStories.map((story, index) => {
                      const isOpen = expandedSuccessIndex === index;
                      return (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden"
                          style={{ border: '1px solid rgba(251,191,36,0.3)' }}
                        >
                          <button
                            onClick={() => setExpandedSuccessIndex(isOpen ? null : index)}
                            className="w-full flex items-center justify-between gap-2 p-3 text-left transition-all hover:bg-white/5"
                            style={{ background: 'rgba(251,191,36,0.1)' }}
                          >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <Award className="w-4 h-4 mt-0.5 text-yellow-300 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-yellow-200">{story.profile}</p>
                                <p className="text-[10px] text-white/60 mt-0.5">{story.admissionType} 합격</p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-yellow-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-3 space-y-2" style={{ background: 'rgba(15,23,42,0.5)' }}>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-300 mb-1.5">
                                  핵심 활동
                                </p>
                                <div className="space-y-1">
                                  {story.keyActivities.map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                      <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0 text-yellow-300" />
                                      <span>{activity}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="rounded-md p-2 bg-yellow-500/10 border border-yellow-500/30">
                                <p className="text-[10px] font-bold text-yellow-200 mb-1">합격 결과</p>
                                <p className="text-xs text-white/90">{story.result}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 월별 준비 타임라인 */}
              {career.monthlyPreparation && career.monthlyPreparation.length > 0 && (
                <div className="rounded-xl p-3 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">월별 준비 타임라인</h4>
                  </div>
                  <p className="text-xs text-white/60 mb-3">학년별 구체적인 실행 계획</p>

                  <div className="space-y-1.5">
                    {career.monthlyPreparation.map((prep, index) => {
                      const isOpen = expandedMonthIndex === index;
                      return (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden"
                          style={{ border: '1px solid rgba(59,130,246,0.3)' }}
                        >
                          <button
                            onClick={() => setExpandedMonthIndex(isOpen ? null : index)}
                            className="w-full flex items-center justify-between gap-2 p-2.5 text-left transition-all hover:bg-white/5"
                            style={{ background: 'rgba(59,130,246,0.1)' }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-blue-200">{prep.period}</p>
                                <p className="text-[10px] text-white/60">{prep.goal}</p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-blue-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-2.5 space-y-1" style={{ background: 'rgba(15,23,42,0.5)' }}>
                              {prep.tasks.map((task, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-blue-400" />
                                  <span>{task}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="rounded-lg p-3 bg-violet-500/10 border border-violet-500/35">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-violet-300" />
                  <h4 className="text-sm font-bold text-violet-200">대입에서 중요한 점</h4>
                </div>
                {(selectedKingdomGuidance?.importantPoints ?? careerDetailGuidance.importantPoints).map((point, index) => (
                  <p key={index} className="text-xs text-violet-100 mb-1.5">
                    • {point}
                  </p>
                ))}
              </div>

              <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/35">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-amber-300" />
                  <h4 className="text-sm font-bold text-amber-200">유의할 점</h4>
                </div>
                {(selectedKingdomGuidance?.cautions ?? careerDetailGuidance.cautions).map((caution, index) => (
                  <p key={index} className="text-xs text-amber-100 mb-1.5">
                    - {caution}
                  </p>
                ))}
              </div>

              <div className="rounded-lg p-3 bg-cyan-500/10 border border-cyan-500/35">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-cyan-300" />
                  <h4 className="text-sm font-bold text-cyan-200">입학사정관이 보는 시야</h4>
                </div>
                {(selectedKingdomGuidance?.admissionsOfficerView ?? careerDetailGuidance.admissionsOfficerView).map((viewpoint, index) => (
                  <p key={index} className="text-xs text-cyan-100 mb-1.5">
                    • {viewpoint}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">전형별 실전 전략: {career.admissionType}</h4>
                </div>
                {admissionTypeStrategyCards.map((strategyCard) => (
                  <div key={strategyCard.typeLabel} className="rounded-lg p-3 bg-white/5 border border-white/10">
                    <p className="text-xs font-bold text-emerald-300 mb-2">{strategyCard.typeLabel} 전략</p>
                    <p className="text-xs text-white/80 mb-1">핵심 전략</p>
                    {strategyCard.strategy.coreStrategies.map((strategy, index) => (
                      <p key={index} className="text-xs text-white/90 mb-1">
                        • {strategy}
                      </p>
                    ))}
                    <p className="text-xs text-white/80 mt-2 mb-1">증빙 체크리스트</p>
                    {strategyCard.strategy.evidenceChecklist.map((evidence, index) => (
                      <p key={index} className="text-xs text-sky-200 mb-1">
                        - {evidence}
                      </p>
                    ))}
                    <p className="text-xs text-white/80 mt-2 mb-1">면접/평가 포인트</p>
                    {strategyCard.strategy.interviewFocus.map((focus, index) => (
                      <p key={index} className="text-xs text-rose-200 mb-1">
                        • {focus}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'universities' && (
            <div className="space-y-3">
              {/* 대학별 상세 정보 */}
              {career.universityDetails && career.universityDetails.length > 0 ? (
                <>
                  <div
                    className="rounded-xl p-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(99,102,241,0.2) 100%)',
                      border: '1px solid rgba(59,130,246,0.35)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <GraduationCap className="w-4 h-4 text-blue-300" />
                      <h4 className="text-sm font-bold text-white">대학별 전형 정보</h4>
                    </div>
                    <p className="text-xs text-white/70">주요 대학의 전형 유형, 경쟁률, 필수 요건</p>
                  </div>

                  <div className="space-y-2">
                    {career.universityDetails.map((univDetail, index) => {
                      const isOpen = expandedUnivIndex === index;
                      return (
                        <div
                          key={index}
                          className="rounded-lg overflow-hidden"
                          style={{ border: '1px solid rgba(59,130,246,0.3)' }}
                        >
                          <button
                            onClick={() => setExpandedUnivIndex(isOpen ? null : index)}
                            className="w-full flex items-center justify-between gap-2 p-3 text-left transition-all hover:bg-white/5"
                            style={{ background: 'rgba(59,130,246,0.1)' }}
                          >
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <GraduationCap className="w-4 h-4 mt-0.5 text-blue-400 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white">{univDetail.university}</p>
                                <p className="text-xs text-blue-200 mt-0.5">{univDetail.department}</p>
                              </div>
                            </div>
                            <ChevronDown
                              className={`w-4 h-4 text-blue-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isOpen && (
                            <div className="p-3 space-y-2" style={{ background: 'rgba(15,23,42,0.5)' }}>
                              {univDetail.admissionTypes.map((admType, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg p-2.5"
                                  style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-blue-200">{admType.type}</p>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200">
                                      {admType.competition}
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] text-white/60 font-semibold">필수 요건</p>
                                    {admType.keyRequirements.map((req, reqIdx) => (
                                      <div key={reqIdx} className="flex items-start gap-2 text-xs text-white/85">
                                        <span className="inline-block w-1 h-1 rounded-full mt-1.5 flex-shrink-0 bg-blue-400" />
                                        <span>{req}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="rounded-lg p-3 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">주요 대학 및 학과</h4>
                  </div>
                  <div className="space-y-2">
                    {career.universities.map((uni, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-sm text-white">{uni}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 지원 팁 */}
              <div className="rounded-lg p-3 bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-300" />
                  <h4 className="text-xs font-bold text-purple-200">지원 전략 팁</h4>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-purple-100">
                    • 상향 1개, 적정 2개, 안정 1개로 포트폴리오 구성
                  </p>
                  <p className="text-xs text-purple-100">
                    • 학과별 인재상과 본인의 활동 연계성 확인
                  </p>
                  <p className="text-xs text-purple-100">
                    • 전년도 입결과 올해 모집인원 변동 체크
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-2">
              <div
                className="rounded-lg p-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
                  border: '1px solid rgba(99,102,241,0.35)',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="w-4 h-4 text-indigo-300" />
                  <h4 className="text-sm font-bold text-indigo-200">{normalizedKingdomLabel} 맞춤 심층 Q&A</h4>
                </div>
                <p className="text-xs text-indigo-100/85">
                  면접/서류/전략 점검에 바로 사용할 수 있는 실전 질문과 답변입니다.
                </p>
              </div>
              {mergedDeepQa.map((item, index) => {
                const isOpen = expandedQaIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-lg overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <button
                      onClick={() => setExpandedQaIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between gap-2 p-3 text-left transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <HelpCircle className="w-4 h-4 mt-0.5 text-indigo-300 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-indigo-200 font-semibold">Q{index + 1}</p>
                          <p className="text-xs text-white font-medium">{item.question}</p>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="p-3" style={{ background: 'rgba(15,23,42,0.5)' }}>
                        <p className="text-xs text-slate-200 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
