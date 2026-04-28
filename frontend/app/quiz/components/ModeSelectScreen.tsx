'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import { LABELS, MODE_ICONS } from '../config';
import type { QuizMode } from '../types';

interface ModeSelectScreenProps {
  onSelect: (mode: QuizMode) => void;
  readonly hasSavedRiasecResult?: boolean;
}

export function ModeSelectScreen({ onSelect, hasSavedRiasecResult = false }: ModeSelectScreenProps) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=hero, 2=card1, 3=card2, 4=tip
  const [launching, setLaunching] = useState<QuizMode | null>(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 80),
      setTimeout(() => setPhase(2), 320),
      setTimeout(() => setPhase(3), 500),
      setTimeout(() => setPhase(4), 700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSelect = (mode: QuizMode) => {
    if (launching) return;
    setLaunching(mode);
    setTimeout(() => onSelect(mode), 380);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#0D0D1A' }}
    >
      <StarfieldCanvas count={140} />

      {/* Nebula blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.07] animate-nebula pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6C5CE7, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.06] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #F39C12, transparent 70%)',
          animation: 'nebula-drift 26s ease-in-out infinite reverse',
        }}
      />

      <div className="relative z-10 w-full max-w-[540px] px-4">

        {/* ── Hero ── */}
        <div
          className="text-center mb-8"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            animation: phase >= 1 ? 'hero-enter 0.6s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
          }}
        >
          {/* Star + orbiting sparkles */}
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-5">
            <span className="text-5xl animate-star-hero select-none">🌟</span>
            <span
              className="absolute text-xs select-none pointer-events-none"
              style={{ animation: 'orbit-sparkle 7s linear infinite' }}
            >✨</span>
            <span
              className="absolute text-[10px] select-none pointer-events-none"
              style={{ animation: 'orbit-sparkle-rev 5s linear infinite' }}
            >💫</span>
          </div>

          <h1
            className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight"
            style={{ textShadow: '0 0 40px rgba(108,92,231,0.6), 0 0 80px rgba(108,92,231,0.2)' }}
          >
            직업 적성 검사
          </h1>
          <p className="text-xs md:text-sm text-purple-300/60 font-medium">
            우주에서 나에게 맞는 직업 유형을 발견해보세요
          </p>

          {/* Decorative divider */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500/40" />
            <span className="text-purple-400/50 text-[10px]">— MISSION SELECT —</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500/40" />
          </div>
        </div>

        {/* ── Saved result banner ── */}
        {hasSavedRiasecResult && phase >= 2 ? (
          <div className="mb-4 space-y-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-left animate-mode-card-enter">
            <p className="text-[11px] md:text-xs font-semibold text-emerald-200/90">
              {LABELS.saved_result_banner}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/quiz/results"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500/25 px-3 py-2 text-[11px] font-bold text-emerald-100 transition hover:bg-emerald-500/35"
              >
                {LABELS.view_saved_result}
              </Link>
            </div>
            <p className="text-[10px] text-gray-500">{LABELS.retake_quiz_hint}</p>
          </div>
        ) : null}

        {/* ── Mode cards ── */}
        <div className="space-y-4">

          {/* ── Quick mode ── */}
          <div
            style={{
              opacity: phase >= 2 ? 1 : 0,
              animation: phase >= 2 ? 'mode-card-enter 0.55s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
            }}
          >
            <button
              onClick={() => handleSelect('10')}
              disabled={!!launching}
              className="w-full rounded-2xl p-4 md:p-5 text-left relative overflow-hidden group transition-all duration-200
                         hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] focus:outline-none
                         disabled:pointer-events-none"
              style={{
                background: launching === '10'
                  ? 'linear-gradient(135deg, rgba(108,92,231,0.45) 0%, rgba(108,92,231,0.25) 100%)'
                  : 'linear-gradient(135deg, rgba(108,92,231,0.18) 0%, rgba(80,60,200,0.08) 100%)',
                border: '2px solid rgba(108,92,231,0.5)',
                animation: 'border-pulse-purple 2.8s ease-in-out infinite',
                transform: launching === '10' ? 'scale(0.97)' : undefined,
                transition: 'transform 0.2s ease, background 0.2s ease',
              }}
            >
              {/* Hover shimmer sweep */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden"
              >
                <div
                  className="absolute inset-y-0 -left-full w-1/2 skew-x-[-12deg] group-hover:left-full transition-all duration-700"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(108,92,231,0.18), transparent)' }}
                />
              </div>
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 50px rgba(108,92,231,0.4), inset 0 0 30px rgba(108,92,231,0.08)' }}
              />
              {/* Launch flash */}
              {launching === '10' && (
                <div className="absolute inset-0 rounded-2xl bg-purple-400/20 animate-pulse pointer-events-none" />
              )}

              <div className="flex items-center gap-4 relative">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    background: 'rgba(108,92,231,0.2)',
                    boxShadow: '0 0 20px rgba(108,92,231,0.3)',
                  }}
                >
                  {launching === '10' ? '🚀' : MODE_ICONS.quick}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base md:text-lg font-black text-white">
                      {LABELS.mode_quick_title}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}
                    >
                      {LABELS.mode_quick_badge}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-400 mb-2">
                    {LABELS.mode_quick_desc}
                  </p>
                  <div className="flex gap-1.5 items-center">
                    {MODE_ICONS.zoneIcons.map((icon, i) => (
                      <span
                        key={i}
                        className="text-sm md:text-base"
                        style={{
                          animation: `icon-float ${3 + i * 0.4}s ease-in-out infinite`,
                          animationDelay: `${i * 0.15}s`,
                          display: 'inline-block',
                        }}
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Arrow */}
                <div
                  className="text-purple-400/40 text-xl group-hover:text-purple-300 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0"
                >
                  →
                </div>
              </div>
            </button>
          </div>

          {/* ── Detailed mode ── */}
          <div
            style={{
              opacity: phase >= 3 ? 1 : 0,
              animation: phase >= 3 ? 'mode-card-enter 0.55s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
            }}
          >
            <button
              onClick={() => handleSelect('30')}
              disabled={!!launching}
              className="w-full rounded-2xl p-4 md:p-5 text-left relative overflow-hidden group transition-all duration-200
                         hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] focus:outline-none
                         disabled:pointer-events-none"
              style={{
                background: launching === '30'
                  ? 'linear-gradient(135deg, rgba(243,156,18,0.4) 0%, rgba(200,120,10,0.25) 100%)'
                  : 'linear-gradient(135deg, rgba(243,156,18,0.16) 0%, rgba(200,120,10,0.07) 100%)',
                border: '2px solid rgba(243,156,18,0.5)',
                animation: 'border-pulse-gold 2.4s ease-in-out infinite',
                transition: 'transform 0.2s ease, background 0.2s ease',
              }}
            >
              {/* Hover shimmer sweep */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
                <div
                  className="absolute inset-y-0 -left-full w-1/2 skew-x-[-12deg] group-hover:left-full transition-all duration-700"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(243,156,18,0.18), transparent)' }}
                />
              </div>
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: '0 0 50px rgba(243,156,18,0.4), inset 0 0 30px rgba(243,156,18,0.06)' }}
              />
              {/* Launch flash */}
              {launching === '30' && (
                <div className="absolute inset-0 rounded-2xl bg-yellow-400/20 animate-pulse pointer-events-none" />
              )}
              {/* Recommended badge */}
              <div
                className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider"
                style={{
                  background: 'rgba(243,156,18,0.25)',
                  color: '#F39C12',
                  border: '1px solid rgba(243,156,18,0.4)',
                  animation: 'recommended-pulse 1.8s ease-in-out infinite',
                }}
              >
                {LABELS.mode_recommended}
              </div>

              <div className="flex items-center gap-4 relative">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
                  style={{
                    background: 'rgba(243,156,18,0.2)',
                    boxShadow: '0 0 20px rgba(243,156,18,0.3)',
                  }}
                >
                  {launching === '30' ? '🚀' : MODE_ICONS.detailed}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base md:text-lg font-black text-white">
                      {LABELS.mode_detailed_title}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ background: 'rgba(243,156,18,0.25)', color: '#fbbf24' }}
                    >
                      {LABELS.mode_detailed_badge}
                    </span>
                  </div>
                  <p className="text-[11px] md:text-xs text-gray-400 mb-2">
                    {LABELS.mode_detailed_desc}
                  </p>
                  <div className="flex gap-1.5 items-center">
                    {MODE_ICONS.zoneIcons.map((icon, i) => (
                      <span
                        key={i}
                        className="text-sm md:text-base"
                        style={{
                          animation: `icon-float ${3.2 + i * 0.4}s ease-in-out infinite`,
                          animationDelay: `${0.2 + i * 0.15}s`,
                          display: 'inline-block',
                        }}
                      >
                        {icon}
                      </span>
                    ))}
                    <span className="text-[9px] text-gray-500 ml-1">× 6문항</span>
                  </div>
                </div>
                {/* Arrow */}
                <div className="text-yellow-500/40 text-xl group-hover:text-yellow-300 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0">
                  →
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ── Tip ── */}
        <p
          className="text-center text-[10px] md:text-[11px] text-gray-600 mt-5"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            animation: phase >= 4 ? 'tip-fade-in 0.7s ease-out forwards' : 'none',
          }}
        >
          {LABELS.mode_tip}
        </p>
      </div>
    </div>
  );
}
