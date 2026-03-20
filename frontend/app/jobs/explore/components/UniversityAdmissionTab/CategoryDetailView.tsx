'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Target, CalendarDays, Zap, Trophy, ShieldCheck, Sparkles, Lightbulb } from 'lucide-react';
import { CategoryPracticalExamplesPanel } from './CategoryPracticalExamplesPanel';

type AdmissionCategory = {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  keyFeatures: string[];
  targetStudents: string[];
  cautions: string[];
  universities: string[];
};

type CategoryPlaybook = {
  categoryId: string;
  coreMessage: string;
  weeklyActions: string[];
  gradeRoadmap: Array<{
    grade: string;
    goal: string;
    missionChecklist: string[];
    outputExamples: string[];
  }>;
  k2028Strategy: Array<{
    change: string;
    studentAction: string;
    deadline: string;
  }>;
  practicalExamples: {
    setakSentenceTemplates: string[];
    interviewQuestions: string[];
    makerAndResearchExamples: string[];
  };
  deepQaByEvidenceArea?: Array<{
    areaId: string;
    areaTitle: string;
    areaSummary: string;
    qaItems: Array<{
      question: string;
      answer: string;
    }>;
  }>;
};

type CategoryDetailViewProps = {
  category: AdmissionCategory;
  playbook: CategoryPlaybook;
  onClose: () => void;
  /** inline: 오른쪽 패널에 삽입 (모달 없음) — jobs/explore 대입 탐색 2컬럼용 */
  variant?: 'modal' | 'inline';
};

type TabId = 'core' | 'grade' | 'strategy2028' | 'practical';

export function CategoryDetailView({ category, playbook, onClose, variant = 'modal' }: CategoryDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('core');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tabs: Array<{ id: TabId; label: string; icon: any }> = [
    { id: 'core', label: '핵심전략', icon: Target },
    { id: 'grade', label: '학년별', icon: CalendarDays },
    { id: 'strategy2028', label: '2028대응', icon: Zap },
    { id: 'practical', label: '실전예시', icon: Trophy },
  ];

  const panelScrollClass =
    variant === 'inline'
      ? 'w-full min-w-0 max-w-full overflow-x-hidden rounded-2xl p-3 sm:p-4 space-y-3'
      : 'w-full min-w-0 max-w-full md:max-w-[28rem] h-[94dvh] md:h-auto md:max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-t-2xl md:rounded-2xl p-3 sm:p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4';

  const panelInner = (
      <div
        className={panelScrollClass}
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
          border: `1px solid ${category.color}55`,
          boxShadow: `0 10px 50px ${category.color}22`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="rounded-2xl p-4"
          style={{ background: category.bgColor, border: `1px solid ${category.color}40` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: category.bgColor,
                border: `2px solid ${category.color}`,
                boxShadow: `0 0 20px ${category.color}40`,
              }}
            >
              {category.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-1">{category.name}</h2>
              <p className="text-sm text-white/80">{category.description}</p>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">{playbook.coreMessage}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-3">
            <div
              className="rounded-lg px-2 py-2 flex flex-col items-center justify-center"
              style={{ background: 'rgba(15,23,42,0.45)', border: `1px solid ${category.color}35` }}
            >
              <Target className="w-4 h-4 mb-1" style={{ color: category.color }} />
              <p className="text-[10px] text-white/90 font-medium text-center">핵심전략</p>
            </div>
            <div
              className="rounded-lg px-2 py-2 flex flex-col items-center justify-center"
              style={{ background: 'rgba(15,23,42,0.45)', border: `1px solid ${category.color}35` }}
            >
              <CalendarDays className="w-4 h-4 mb-1" style={{ color: category.color }} />
              <p className="text-[10px] text-white/90 font-medium text-center">학년별</p>
            </div>
            <div
              className="rounded-lg px-2 py-2 flex flex-col items-center justify-center"
              style={{ background: 'rgba(15,23,42,0.45)', border: `1px solid ${category.color}35` }}
            >
              <Zap className="w-4 h-4 mb-1" style={{ color: category.color }} />
              <p className="text-[10px] text-white/90 font-medium text-center">2028대응</p>
            </div>
            <div
              className="rounded-lg px-2 py-2 flex flex-col items-center justify-center"
              style={{ background: 'rgba(15,23,42,0.45)', border: `1px solid ${category.color}35` }}
            >
              <Trophy className="w-4 h-4 mb-1" style={{ color: category.color }} />
              <p className="text-[10px] text-white/90 font-medium text-center">실전예시</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center gap-1 px-2.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                style={{
                  background: activeTab === tab.id ? category.bgColor : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === tab.id ? category.color : 'rgba(255,255,255,0.12)'}`,
                  color: activeTab === tab.id ? category.color : 'rgba(255,255,255,0.75)',
                }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'core' && <CoreStrategyTab category={category} playbook={playbook} />}
        {activeTab === 'grade' && <GradeRoadmapTab category={category} playbook={playbook} />}
        {activeTab === 'strategy2028' && <Strategy2028Tab category={category} playbook={playbook} />}
        {activeTab === 'practical' && (
          <CategoryPracticalExamplesPanel category={category} playbook={playbook} />
        )}
      </div>
  );

  if (!mounted) return null;

  if (variant === 'inline') {
    return panelInner;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(2,6,23,0.88)' }}
      onClick={onClose}
    >
      {panelInner}
    </div>,
    document.body
  );
}

function CoreStrategyTab({ category, playbook }: { category: AdmissionCategory; playbook: CategoryPlaybook }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4" style={{ color: category.color }} />
          <h3 className="text-sm font-bold text-white">지금 당장 해야 할 주간 액션</h3>
        </div>
        <div className="space-y-1.5">
          {playbook.weeklyActions.map((action, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm text-white/85 p-2 rounded-lg"
              style={{ background: category.bgColor, border: `1px solid ${category.color}2a` }}
            >
              <span style={{ color: category.color }}>✔</span>
              <span className="flex-1">{action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-2">합격에 직접 연결되는 핵심 특징</h3>
        {category.keyFeatures.map((feature, index) => (
          <p key={index} className="text-sm text-white/80 mb-1">
            • {feature}
          </p>
        ))}
      </div>

      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-2">이 전형과 잘 맞는 학생 유형</h3>
        {category.targetStudents.map((student, index) => (
          <p key={index} className="text-sm text-white/80 mb-1">
            • {student}
          </p>
        ))}
      </div>
    </div>
  );
}

function GradeRoadmapTab({ category, playbook }: { category: AdmissionCategory; playbook: CategoryPlaybook }) {
  const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>(() =>
    playbook.gradeRoadmap.reduce<Record<string, boolean>>((acc, g) => {
      acc[g.grade] = true;
      return acc;
    }, {})
  );

  const toggleGrade = (grade: string) => {
    setExpandedGrades((prev) => ({ ...prev, [grade]: !prev[grade] }));
  };

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-white/60 mb-2 px-1">학년별 트리 — 탭하여 펼치기/접기</p>
      {playbook.gradeRoadmap.map((gradePlan) => {
        const isOpen = expandedGrades[gradePlan.grade] ?? true;
        return (
          <div
            key={gradePlan.grade}
            className="rounded-xl overflow-hidden"
            style={{ border: `1px solid ${category.color}40` }}
          >
            {/* 학년 헤더 (트리 루트) */}
            <button
              onClick={() => toggleGrade(gradePlan.grade)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
              style={{ background: category.bgColor }}
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: category.color }} />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: category.color }} />
              )}
              <CalendarDays className="w-4 h-4 flex-shrink-0" style={{ color: category.color }} />
              <span className="text-sm font-bold text-white">{gradePlan.grade}</span>
            </button>

            {/* 하위 노드 (목표 → 미션 → 결과물) */}
            {isOpen && (
              <div className="space-y-0" style={{ background: 'rgba(15,23,42,0.45)' }}>
                {/* 1단계: 핵심 목표 */}
                <div className="px-4 py-2 pl-8 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: category.color }}>
                    핵심 목표
                  </p>
                  <p className="text-xs text-white/90">{gradePlan.goal}</p>
                </div>

                {/* 2단계: 미션 체크리스트 */}
                <div className="px-4 py-2 pl-8 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: category.color }}>
                    미션 체크리스트
                  </p>
                  <ul className="space-y-1">
                    {gradePlan.missionChecklist.map((mission, idx) => (
                      <li key={idx} className="text-xs text-white/85 flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: category.color }} />
                        <span>{mission}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3단계: 실전 결과물 예시 */}
                <div className="px-4 py-2 pl-8 border-t border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: category.color }}>
                    실전 결과물 예시
                  </p>
                  <ul className="space-y-1">
                    {gradePlan.outputExamples.map((item, idx) => (
                      <li key={idx} className="text-xs text-white/80 flex items-start gap-2">
                        <span className="text-[10px] opacity-70">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Strategy2028Tab({ category, playbook }: { category: AdmissionCategory; playbook: CategoryPlaybook }) {
  return (
    <div className="space-y-3">
      <div
        className="rounded-xl p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.2) 100%)',
          border: '1px solid rgba(251,191,36,0.35)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-300" />
          <h3 className="text-sm font-bold text-white">2028 개편 대응 액션 플랜</h3>
        </div>
        {playbook.k2028Strategy.map((strategy, index) => (
          <div key={index} className="rounded-lg p-2.5 bg-black/25 mb-2 last:mb-0">
            <p className="text-xs text-yellow-200 font-semibold mb-1">{strategy.change}</p>
            <p className="text-xs text-white/85 mb-1">실행: {strategy.studentAction}</p>
            <p className="text-xs text-white/70">점검 시점: {strategy.deadline}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-2">대학 리스트(참고)</h3>
        <div className="flex flex-wrap gap-1.5">
          {category.universities.map((university, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 rounded-full"
              style={{ background: category.bgColor, border: `1px solid ${category.color}40`, color: 'white' }}
            >
              {university}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
