'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Sparkles, Star, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { storage } from '@/lib/storage';
import { generateRIASECResult } from '@/lib/riasec';
import allQuestionsData from '@/data/quiz-questions.json';
import type { QuizQuestion } from '@/lib/types';

type QuizMode = '10' | '30';

const allQuestions = allQuestionsData as unknown as (QuizQuestion & {
  zone: string;
  zoneIcon: string;
  feedbackMap: Record<string, string>;
})[];

const ZONE_COLORS: Record<string, string> = {
  '성격': '#6C5CE7',
  '흥미': '#E74C3C',
  '강점': '#27AE60',
  '가치관': '#F39C12',
  '학습': '#3498DB',
};

function getZoneColor(zone: string) {
  return ZONE_COLORS[zone] ?? '#6C5CE7';
}

/* ─────────── Feedback Overlay ─────────── */
function FeedbackOverlay({
  feedback,
  zone,
  zoneIcon,
  onNext,
  isLast,
}: {
  feedback: string;
  zone: string;
  zoneIcon: string;
  onNext: () => void;
  isLast: boolean;
}) {
  const color = getZoneColor(zone);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-[430px] rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1A1A2E 0%, ${color}22 100%)`,
          border: `1.5px solid ${color}55`,
          boxShadow: `0 0 40px ${color}33`,
          animation: 'slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Glow orb */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${color}33` }}
        />

        <div className="relative">
          {/* Zone badge */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
            >
              {zoneIcon}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
              {zone} 분석 완료
            </span>
            <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color }} />
          </div>

          {/* Feedback text */}
          <p className="text-base font-semibold text-white leading-relaxed mb-5">
            {feedback}
          </p>

          {/* Next button */}
          <button
            onClick={onNext}
            className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
          >
            {isLast ? '결과 보기 🏆' : '다음 문제로'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─────────── Mode Select Screen ─────────── */
function ModeSelectScreen({ onSelect }: { onSelect: (mode: QuizMode) => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}>
      {/* Stars */}
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: 1 + (i % 2),
            height: 1 + (i % 2),
            left: `${(i * 13 + 7) % 100}%`,
            top: `${(i * 17 + 5) % 100}%`,
            opacity: 0.2 + (i % 3) * 0.1,
            animation: `twinkle ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="text-2xl font-black text-white mb-2">직업 적성 검사</h1>
          <p className="text-sm text-gray-400">나에게 맞는 직업 유형을 발견해보세요</p>
        </div>

        <div className="space-y-4">
          {/* 10문항 */}
          <button
            onClick={() => onSelect('10')}
            className="w-full rounded-3xl p-5 text-left relative overflow-hidden group transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2) 0%, rgba(108,92,231,0.08) 100%)',
              border: '1.5px solid rgba(108,92,231,0.4)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(108,92,231,0.25)' }}>
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">빠른 검사</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">10문항</span>
                </div>
                <p className="text-sm text-gray-400">약 3~5분 • 핵심 5개 유형 탐색</p>
                <div className="flex gap-1 mt-2">
                  {['🧠', '❤️', '💪', '🌈', '📚'].map((icon, i) => (
                    <span key={i} className="text-base">{icon}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* 30문항 */}
          <button
            onClick={() => onSelect('30')}
            className="w-full rounded-3xl p-5 text-left relative overflow-hidden group transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(243,156,18,0.2) 0%, rgba(243,156,18,0.08) 100%)',
              border: '1.5px solid rgba(243,156,18,0.4)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(243,156,18,0.25)' }}>
                🔭
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">정밀 검사</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300">30문항</span>
                </div>
                <p className="text-sm text-gray-400">약 10~15분 • 상세 강점 리포트 제공</p>
                <div className="flex gap-1 mt-2">
                  {['🧠', '❤️', '💪', '🌈', '📚'].map((icon, i) => (
                    <span key={i} className="text-base">{icon}</span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1 self-center">× 6문항</span>
                </div>
              </div>
            </div>
            {/* Recommended badge */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(243,156,18,0.3)', color: '#F39C12' }}>
              추천
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          정답이 없어요! 솔직하게 답하면 더 정확해요 ✨
        </p>
      </div>
    </div>
  );
}

/* ─────────── Main Quiz Page ─────────── */
export default function QuizPage() {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [xpPopVisible, setXpPopVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(true);
  const [pendingFeedback, setPendingFeedback] = useState<{
    text: string; zone: string; zoneIcon: string; isLast: boolean
  } | null>(null);
  const touchRef = useRef<{ x: number } | null>(null);

  const questions = mode
    ? mode === '10'
      ? allQuestions.filter((_, i) => i % 3 === 0).slice(0, 10)
      : allQuestions
    : [];

  const q = questions[currentIndex];
  const color = q ? getZoneColor(q.zone) : '#6C5CE7';
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    setChoicesVisible(false);
    const t = setTimeout(() => setChoicesVisible(true), 80);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const finishQuiz = useCallback((finalAnswers: Record<number, number>) => {
    const map: Record<number, string> = {};
    questions.forEach((qq, i) => {
      const ci = finalAnswers[i] ?? 0;
      map[qq.id] = qq.choices[ci]?.id || qq.choices[0].id;
    });
    const result = generateRIASECResult(questions, map);
    storage.riasec.set(result);
    storage.user.set({
      id: Date.now().toString(),
      nickname: '탐험가',
      grade: '',
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    });
    router.push('/quiz/results');
  }, [questions, router]);

  const pickAnswer = (choiceId: string, choiceIdx: number) => {
    if (animating || pendingFeedback) return;
    setAnimating(true);

    const next = { ...answers, [currentIndex]: choiceIdx };
    setAnswers(next);

    setXpPopVisible(true);
    setTimeout(() => setXpPopVisible(false), 900);

    // Show feedback after selection
    const feedbackText = q.feedbackMap?.[String(choiceIdx)] ?? '좋은 선택이에요! 계속해봐요 🌟';
    const isLast = currentIndex === questions.length - 1;

    setTimeout(() => {
      setPendingFeedback({
        text: feedbackText,
        zone: q.zone,
        zoneIcon: q.zoneIcon,
        isLast,
      });
      setAnimating(false);
    }, 400);
  };

  const handleFeedbackNext = () => {
    const isLast = pendingFeedback?.isLast;
    setPendingFeedback(null);

    if (isLast) {
      finishQuiz(answers);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setMode(null);
    }
  };

  if (!mode) return <ModeSelectScreen onSelect={setMode} />;
  if (!q) return null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}
      onTouchStart={(e) => { touchRef.current = { x: e.touches[0].clientX }; }}
      onTouchEnd={(e) => {
        if (!touchRef.current) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        if (dx > 80 && currentIndex > 0 && !pendingFeedback) goBack();
        touchRef.current = null;
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] transition-colors duration-700"
        style={{ backgroundColor: `${color}20` }}
      />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3 + (i % 3),
            height: 3 + (i % 3),
            left: `${8 + i * 11}%`,
            top: `${10 + (i * 17) % 80}%`,
            backgroundColor: color,
            opacity: 0.12 + (i % 3) * 0.04,
            animation: `float ${4 + i * 0.7}s ease-in-out ${i * 0.3}s infinite`,
          }}
        />
      ))}

      {/* ===== HEADER ===== */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{q.zoneIcon}</span>
                <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color }}>
                  {q.zone} · Q{currentIndex + 1}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Zap className="w-3.5 h-3.5" style={{ color }} />
                {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* Segmented progress */}
            <div className="flex gap-[3px]">
              {questions.map((_, i) => {
                const done = answers[i] !== undefined;
                const active = i === currentIndex;
                const c = getZoneColor(questions[i].zone);
                return (
                  <div
                    key={i}
                    className="h-[5px] rounded-full flex-1 transition-all duration-300"
                    style={{
                      backgroundColor: done ? c : active ? `${c}55` : 'rgba(255,255,255,0.06)',
                      boxShadow: done ? `0 0 6px ${c}50` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== QUESTION AREA ===== */}
      <div className="relative z-10 flex-1 px-4 pb-4 flex flex-col">
        {/* Situation badge */}
        <div
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full text-xs font-bold mb-4"
          style={{
            backgroundColor: `${color}12`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          <Star className="w-3.5 h-3.5" />
          {q.situation}
        </div>

        {/* Question card */}
        <div
          className="relative p-5 rounded-2xl mb-5 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.03) 100%)`,
            border: `1px solid ${color}25`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
          <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none"
            style={{ backgroundColor: `${color}15` }} />

          <p className="relative z-10 text-lg font-bold leading-relaxed">
            {q.description}
          </p>
        </div>

        {/* XP Pop */}
        {xpPopVisible && (
          <div
            className="absolute top-20 right-8 flex items-center gap-1 text-sm font-extrabold pointer-events-none"
            style={{
              color: '#FBBF24',
              animation: 'xp-pop 0.9s ease-out forwards',
            }}
          >
            <Sparkles className="w-4 h-4" /> +5 XP
          </div>
        )}

        {/* ===== CHOICES ===== */}
        <div className="flex-1 flex flex-col gap-3">
          {choicesVisible && q.choices.map((choice, idx) => {
            const selected = answers[currentIndex] === idx;
            const letters = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={choice.id}
                onClick={() => pickAnswer(choice.id, idx)}
                disabled={animating || !!pendingFeedback}
                className="w-full text-left rounded-2xl flex items-start gap-3 transition-all duration-200 active:scale-[0.97]"
                style={{
                  padding: '14px 16px',
                  backgroundColor: selected ? `${color}18` : 'rgba(255,255,255,0.03)',
                  border: selected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: selected ? `0 0 24px ${color}20, inset 0 1px 0 ${color}10` : 'none',
                  animation: `choice-enter 0.35s ease-out ${idx * 0.07}s both`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: selected ? color : `${color}12`,
                    color: selected ? '#fff' : color,
                    boxShadow: selected ? `0 0 12px ${color}40` : 'none',
                  }}
                >
                  <span className="text-sm font-bold">{letters[idx]}</span>
                </div>
                <span
                  className="text-[14px] leading-relaxed pt-1.5 transition-colors duration-200"
                  style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.65)' }}
                >
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== BOTTOM STATUS ===== */}
      <div className="relative z-10 px-4 pb-5 pt-2">
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(108,92,231,0.06) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <Sparkles className="w-3 h-3" style={{ color: '#FBBF24' }} />
            <span className="font-semibold">{answeredCount * 5} XP 획득</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(answeredCount / questions.length) * 100}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}AA)`,
                  boxShadow: `0 0 8px ${color}40`,
                }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {Math.round((answeredCount / questions.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* ===== FEEDBACK OVERLAY ===== */}
      {pendingFeedback && (
        <FeedbackOverlay
          feedback={pendingFeedback.text}
          zone={pendingFeedback.zone}
          zoneIcon={pendingFeedback.zoneIcon}
          onNext={handleFeedbackNext}
          isLast={pendingFeedback.isLast}
        />
      )}
    </div>
  );
}
