'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Sparkles, Star, Zap, Crown, Shield, Flame } from 'lucide-react';
import { storage } from '@/lib/storage';
import { generateRIASECResult } from '@/lib/riasec';
import questionsData from '@/data/questions.json';
import type { QuizQuestion } from '@/lib/types';

const questions = questionsData as unknown as QuizQuestion[];

const QUEST_COLORS = ['#6C5CE7', '#3B82F6', '#22C55E', '#FBBF24', '#EF4444'];
const CHOICE_ICONS = [Crown, Shield, Flame, Star];

function getColor(idx: number) {
  return QUEST_COLORS[Math.floor(idx / 4) % QUEST_COLORS.length];
}

export default function QuizPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [xpPopVisible, setXpPopVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(true);
  const touchRef = useRef<{ x: number } | null>(null);

  const q = questions[currentIndex];
  const color = getColor(currentIndex);
  const answeredCount = Object.keys(answers).length;

  // Reset choices visibility when question changes
  useEffect(() => {
    setChoicesVisible(false);
    const t = setTimeout(() => setChoicesVisible(true), 80);
    return () => clearTimeout(t);
  }, [currentIndex]);

  if (!q) return null;

  const pickAnswer = (choiceId: string, choiceIdx: number) => {
    if (animating) return;
    setAnimating(true);

    const next = { ...answers, [currentIndex]: choiceIdx };
    setAnswers(next);

    // Show XP pop
    setXpPopVisible(true);
    setTimeout(() => setXpPopVisible(false), 900);

    // Transition to next
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Compute results
        const map: Record<number, string> = {};
        questions.forEach((qq, i) => {
          const ci = next[i] ?? 0;
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
      }
      setAnimating(false);
    }, 500);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.push('/quiz/intro');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}
      onTouchStart={(e) => { touchRef.current = { x: e.touches[0].clientX }; }}
      onTouchEnd={(e) => {
        if (!touchRef.current) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        if (dx > 80 && currentIndex > 0) goBack();
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

      {/* ========== HEADER ========== */}
      <div className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          {/* Back */}
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>

          {/* Title + Count */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color }}>
                Quest {currentIndex + 1}
              </span>
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
                return (
                  <div
                    key={i}
                    className="h-[5px] rounded-full flex-1 transition-all duration-300"
                    style={{
                      backgroundColor: done
                        ? getColor(i)
                        : active
                          ? `${color}55`
                          : 'rgba(255,255,255,0.06)',
                      boxShadow: done ? `0 0 6px ${getColor(i)}50` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========== QUESTION AREA ========== */}
      <div className="relative z-10 flex-1 px-4 pb-4 flex flex-col">
        {/* Situation badge */}
        <div
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 transition-all duration-300"
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
          {/* Shimmer */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
          {/* Corner glow orb */}
          <div
            className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none"
            style={{ backgroundColor: `${color}15` }}
          />

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

        {/* ========== CHOICES ========== */}
        <div className="flex-1 flex flex-col gap-3">
          {choicesVisible && q.choices.map((choice, idx) => {
            const selected = answers[currentIndex] === idx;
            const ChoiceIcon = CHOICE_ICONS[idx % CHOICE_ICONS.length];
            const letters = ['A', 'B', 'C', 'D'];
            return (
              <button
                key={choice.id}
                onClick={() => pickAnswer(choice.id, idx)}
                disabled={animating}
                className="w-full text-left rounded-2xl flex items-start gap-3 transition-all duration-200 active:scale-[0.97]"
                style={{
                  padding: '14px 16px',
                  backgroundColor: selected ? `${color}18` : 'rgba(255,255,255,0.03)',
                  border: selected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: selected ? `0 0 24px ${color}20, inset 0 1px 0 ${color}10` : 'none',
                  opacity: 1,
                  transform: 'translateX(0)',
                  animation: `choice-enter 0.35s ease-out ${idx * 0.07}s both`,
                }}
              >
                {/* Letter badge */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: selected ? color : `${color}12`,
                    color: selected ? '#fff' : color,
                    boxShadow: selected ? `0 0 12px ${color}40` : 'none',
                  }}
                >
                  {selected ? (
                    <ChoiceIcon className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-bold">{letters[idx]}</span>
                  )}
                </div>

                {/* Text */}
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

      {/* ========== BOTTOM BAR ========== */}
      <div className="relative z-10 px-4 pb-5 pt-2">
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(108,92,231,0.06) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ backgroundColor: '#FBBF2420' }}
            >
              <Sparkles className="w-3 h-3" style={{ color: '#FBBF24' }} />
            </div>
            <span className="font-semibold">
              {answeredCount * 5} XP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-24 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
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
    </div>
  );
}
