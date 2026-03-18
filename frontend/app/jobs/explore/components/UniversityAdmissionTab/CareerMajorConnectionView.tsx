'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Briefcase, BookOpen, Target, Lightbulb, GraduationCap, X } from 'lucide-react';
import careerDetailGuidanceData from '@/data/university-admission/career-detail-guidance.json';
type Career = {
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
};

type CareerMajorConnectionViewProps = {
  careers: Career[];
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
  kingdomGuidance?: Record<string, { importantPoints: string[]; cautions: string[]; admissionsOfficerView: string[]; deepQa: Array<{ question: string; answer: string }> }>;
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

export function CareerMajorConnectionView({ careers }: CareerMajorConnectionViewProps) {
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
  const [selectedKingdom, setSelectedKingdom] = useState<string | null>(null);

  const kingdoms = Array.from(new Set(careers.map(c => c.kingdom)));
  const filteredCareers = selectedKingdom
    ? careers.filter(c => c.kingdom === selectedKingdom)
    : careers;

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
          border: '1px solid rgba(16,185,129,0.3)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">직업(과)별 대입 준비 전략</h3>
        </div>
        <p className="text-xs text-white/70">
          32개 직업별로 어떤 학과에 진학해야 하고, 세특에 무엇을 써야 하는지 알려드립니다.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedKingdom(null)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
          style={{
            background: selectedKingdom === null ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${selectedKingdom === null ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: selectedKingdom === null ? 'white' : 'rgba(255,255,255,0.6)',
          }}
        >
          전체
        </button>
        {kingdoms.map((kingdom) => (
          <button
            key={kingdom}
            onClick={() => setSelectedKingdom(kingdom)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background: selectedKingdom === kingdom ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${selectedKingdom === kingdom ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: selectedKingdom === kingdom ? 'white' : 'rgba(255,255,255,0.6)',
            }}
          >
            {kingdom}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredCareers.map((career) => (
          <button
            key={career.id}
            onClick={() => setSelectedCareer(career)}
            className="w-full text-left rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-[0.98] bg-white/5 border border-white/10 hover:border-emerald-500/30"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-white/10">
                {career.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white">{career.name}</h4>
                  <span className="text-xs text-white/50">{career.kingdom}</span>
                </div>
                <p className="text-xs text-white/70 mb-1">{career.targetMajor}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {career.admissionType}
                  </span>
                </div>
              </div>
              <span className="text-white/40">→</span>
            </div>
          </button>
        ))}
      </div>

      {selectedCareer && (
        <CareerDetailModal career={selectedCareer} onClose={() => setSelectedCareer(null)} />
      )}
    </div>
  );
}

function CareerDetailModal({ career, onClose }: { career: Career; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'setak' | 'projects' | 'universities' | 'strategy' | 'qa'>('setak');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <div
        className="w-full min-w-0 max-w-full md:max-w-[28rem] h-[94dvh] md:h-auto md:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-t-2xl md:rounded-2xl md:mx-auto pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0"
        style={{
          background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.95) 100%)',
          border: '2px solid rgba(16,185,129,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div
            className="w-12 h-1 rounded-full bg-white/30"
            aria-hidden
          />
        </div>
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
              <p className="text-xs text-emerald-400">{career.targetMajor}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:opacity-70 transition-all touch-manipulation"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'setak' as const, label: '세특 예시', emoji: '📝' },
              { id: 'projects' as const, label: '프로젝트', emoji: '💡' },
              { id: 'universities' as const, label: '대학', emoji: '🎓' },
              { id: 'strategy' as const, label: '입시전략', emoji: '🧭' },
              { id: 'qa' as const, label: '심층Q&A', emoji: '🎤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === tab.id ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
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
                  <Target className="w-4 h-4 text-emerald-400" />
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
            </>
          )}

          {activeTab === 'projects' && (
            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-bold text-white">프로젝트 아이디어</h4>
              </div>
              <div className="space-y-2">
                {career.projectIdeas.map((idea, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-white/80 p-2 rounded-lg bg-white/5"
                  >
                    <span className="text-yellow-400">💡</span>
                    <span>{idea}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'universities' && (
            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-white">주요 대학 및 학과</h4>
              </div>
              <div className="space-y-2">
                {career.universities.map((uni, index) => (
                  <div
                    key={index}
                    className="text-sm px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-white"
                  >
                    {uni}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-3">
              <div className="rounded-lg p-3 bg-violet-500/10 border border-violet-500/35">
                <h4 className="text-sm font-bold text-violet-200 mb-2">대입에서 중요한 점</h4>
                {(selectedKingdomGuidance?.importantPoints ?? careerDetailGuidance.importantPoints).map((point, index) => (
                  <p key={index} className="text-xs text-violet-100 mb-1.5">
                    • {point}
                  </p>
                ))}
              </div>

              <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/35">
                <h4 className="text-sm font-bold text-amber-200 mb-2">유의할 점</h4>
                {(selectedKingdomGuidance?.cautions ?? careerDetailGuidance.cautions).map((caution, index) => (
                  <p key={index} className="text-xs text-amber-100 mb-1.5">
                    - {caution}
                  </p>
                ))}
              </div>

              <div className="rounded-lg p-3 bg-cyan-500/10 border border-cyan-500/35">
                <h4 className="text-sm font-bold text-cyan-200 mb-2">입학사정관이 보는 시야</h4>
                {(selectedKingdomGuidance?.admissionsOfficerView ?? careerDetailGuidance.admissionsOfficerView).map((viewpoint, index) => (
                  <p key={index} className="text-xs text-cyan-100 mb-1.5">
                    • {viewpoint}
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white">전형별 실전 전략: {career.admissionType}</h4>
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

          {activeTab === 'qa' && (
            <div className="space-y-2">
              <div className="rounded-lg p-3 bg-indigo-500/12 border border-indigo-500/35">
                <h4 className="text-sm font-bold text-indigo-200 mb-1">{normalizedKingdomLabel} 맞춤 심층 Q&A 20문항</h4>
                <p className="text-xs text-indigo-100/85">
                  면접/서류/전략 점검에 바로 사용할 수 있는 실전 질문과 답변입니다.
                </p>
              </div>
              {mergedDeepQa.map((item, index) => (
                <div key={index} className="rounded-lg p-3 bg-white/5 border border-white/10">
                  <p className="text-xs font-semibold text-white mb-1">
                    Q{index + 1}. {item.question}
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">A. {item.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
