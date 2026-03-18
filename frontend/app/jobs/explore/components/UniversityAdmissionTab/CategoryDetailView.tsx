'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Target, CalendarDays, Zap } from 'lucide-react';
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
};

type TabId = 'core' | 'grade' | 'strategy2028' | 'practical';

export function CategoryDetailView({ category, playbook, onClose }: CategoryDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('core');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const tabs: Array<{ id: TabId; label: string; emoji: string }> = [
    { id: 'core', label: '핵심전략', emoji: '🎯' },
    { id: 'grade', label: '학년별', emoji: '📅' },
    { id: 'strategy2028', label: '2028대응', emoji: '⚡' },
    { id: 'practical', label: '실전예시', emoji: '🧪' },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(2,6,23,0.88)' }}
      onClick={onClose}
    >
      <div
        className="w-full min-w-0 max-w-full md:max-w-[28rem] h-[94dvh] md:h-auto md:max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-t-2xl md:rounded-2xl p-3 sm:p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4"
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
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
              aria-label="상세 닫기"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              style={{
                background: activeTab === tab.id ? category.bgColor : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeTab === tab.id ? category.color : 'rgba(255,255,255,0.12)'}`,
                color: activeTab === tab.id ? category.color : 'rgba(255,255,255,0.75)',
              }}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'core' && <CoreStrategyTab category={category} playbook={playbook} />}
        {activeTab === 'grade' && <GradeRoadmapTab category={category} playbook={playbook} />}
        {activeTab === 'strategy2028' && <Strategy2028Tab category={category} playbook={playbook} />}
        {activeTab === 'practical' && (
          <CategoryPracticalExamplesPanel category={category} playbook={playbook} />
        )}
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
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
  return (
    <div className="space-y-3">
      {playbook.gradeRoadmap.map((gradePlan) => (
        <div
          key={gradePlan.grade}
          className="rounded-xl p-3"
          style={{ background: category.bgColor, border: `1px solid ${category.color}44` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4" style={{ color: category.color }} />
            <h3 className="text-sm font-bold text-white">{gradePlan.grade} 핵심 목표</h3>
          </div>
          <p className="text-sm text-white/85 mb-3">{gradePlan.goal}</p>

          <p className="text-xs font-bold text-white/90 mb-1.5">미션 체크리스트</p>
          {gradePlan.missionChecklist.map((mission, idx) => (
            <p key={idx} className="text-xs text-white/85 mb-1">
              - {mission}
            </p>
          ))}

          <p className="text-xs font-bold text-white/90 mt-3 mb-1.5">실전 결과물 예시</p>
          {gradePlan.outputExamples.map((item, idx) => (
            <p key={idx} className="text-xs text-white/80 mb-1">
              • {item}
            </p>
          ))}
        </div>
      ))}
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
