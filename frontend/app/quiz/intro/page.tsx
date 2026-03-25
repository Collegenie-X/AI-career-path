'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import { storage } from '@/lib/storage';
import {
  HeroIcon,
  RewardPreview,
  SavedResultChoiceBanner,
} from './components';
import { STAT_ITEMS, TIPS, LABELS, ROUTES } from './config';

export default function QuizIntroPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [hasSavedRiasecResult, setHasSavedRiasecResult] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setHasSavedRiasecResult(storage.riasec.get() !== null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-black">
      <StarfieldCanvas count={120} />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/8 to-transparent pointer-events-none" />

      <div className="web-container relative z-10 flex-1 flex flex-col justify-center py-10 md:py-20">
        <div className="max-w-4xl mx-auto w-full">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-8 md:px-10 md:py-12">
          {hasSavedRiasecResult ? (
            <div
              style={{
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0)' : 'translateY(12px)',
                transition: 'all 0.5s ease-out',
              }}
            >
              <SavedResultChoiceBanner />
            </div>
          ) : null}

          {/* Hero section */}
          <div
            className="flex flex-col items-center text-center mb-10 md:mb-12"
            style={{ 
              opacity: show ? 1 : 0, 
              transform: show ? 'translateY(0)' : 'translateY(20px)', 
              transition: 'all 0.6s ease-out' 
            }}
          >
            <HeroIcon />
            
            <div className="mb-3">
              <span
                className="inline-block text-[10px] md:text-[11px] font-extrabold px-2.5 py-1 rounded-full mb-4 uppercase tracking-widest"
                style={{ background: 'rgba(108,92,231,0.15)', color: '#a29bfe', border: '1px solid rgba(108,92,231,0.3)' }}
              >
                STEP 01
              </span>
            </div>

            <h4 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2.5 text-white">
              {LABELS.title}
            </h4>
            <p className="text-xs md:text-sm text-white/50 max-w-xl">
              {LABELS.subtitle}
            </p>
          </div>

          {/* Stats grid - 웹에서는 4열 */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-10 max-w-2xl mx-auto"
            style={{ 
              opacity: show ? 1 : 0, 
              transform: show ? 'translateY(0)' : 'translateY(20px)', 
              transition: 'all 0.6s ease-out 0.15s' 
            }}
          >
            {STAT_ITEMS.map((item) => (
              <div
                key={item.label}
                className="group relative p-2 md:py-6 rounded-2xl overflow-hidden text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(255,255,255,0.08)' 
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `0 0 30px ${item.color}20` }}
                />
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${item.color}18` }}
                >
                  <item.icon className="w-6 h-6 md:w-7 md:h-7" style={{ color: item.color }} />
                </div>
                <div className="font-bold text-lg md:text-xl mb-1 tabular-nums min-h-[1.75rem] md:min-h-[2rem] flex items-center justify-center leading-none" style={{ color: item.color }}>
                  {item.label}
                </div>
                <div className="text-xs text-white/40">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Reward preview */}
          <div
            className="max-w-2xl mx-auto mb-8 md:mb-10"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s ease-out 0.25s',
            }}
          >
            <RewardPreview show={show} />
          </div>

          {/* Tips list */}
          <div
            className="max-w-2xl mx-auto mb-10 md:mb-12"
            style={{ 
              opacity: show ? 1 : 0, 
              transform: show ? 'translateY(0)' : 'translateY(20px)', 
              transition: 'all 0.6s ease-out 0.35s' 
            }}
          >
            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest text-center mb-4">
              {LABELS.tips_title}
            </div>
            <div className="space-y-3">
              {TIPS.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-white/[0.06]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(108,92,231,0.15)' }}
                  >
                    <tip.icon className="w-4 h-4 text-[#a29bfe]" />
                  </div>
                  <span className="text-sm md:text-base text-white/60">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA: 저장 결과가 없을 때만 하단 대형 버튼 — 있으면 상단 배너에서 리포트/퀘스트 시작 */}
          {!hasSavedRiasecResult ? (
            <div
              className="max-w-2xl mx-auto w-full"
              style={{
                opacity: show ? 1 : 0,
                transform: show ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease-out 0.45s',
              }}
            >
              <Button
                size="lg"
                className="w-full h-14 md:h-16 text-base md:text-lg font-bold rounded-2xl border-0 relative overflow-hidden transition-all hover:scale-105 active:scale-95 group"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                  boxShadow: '0 8px 40px rgba(108,92,231,0.5)',
                }}
                onClick={() => router.push(ROUTES.quizPlay)}
              >
                <span className="absolute inset-0 animate-shimmer" />
                <span className="relative flex items-center justify-center gap-2.5">
                  <Zap className="w-5 h-5 md:w-6 md:h-6" />
                  {LABELS.cta_button}
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              <p className="text-center text-xs md:text-sm text-white/30 mt-4">
                {LABELS.cta_note}
              </p>
            </div>
          ) : (
            <p className="text-center text-xs text-white/35 max-w-2xl mx-auto">
              {LABELS.cta_note}
            </p>
          )}
          </section>
        </div>
      </div>

      {/* Decorative floating icons */}
      {['🎯', '⭐', '🧠', '💡'].map((icon, i) => (
        <div
          key={i}
          className="absolute text-3xl md:text-4xl select-none hidden md:block opacity-20"
          style={{
            top: `${15 + i * 20}%`,
            left: i % 2 === 0 ? `${8 + i * 2}%` : undefined,
            right: i % 2 !== 0 ? `${8 + i * 2}%` : undefined,
            animation: `icon-float ${3 + i * 0.5}s ease-in-out ${i * 0.4}s infinite`,
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
}
