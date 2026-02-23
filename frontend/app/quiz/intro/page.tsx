'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Brain, Clock, HelpCircle, Sparkles, Target, Lightbulb, Shield, Zap } from 'lucide-react';

const STAT_ITEMS = [
  { icon: HelpCircle, label: '20문항', desc: '상황 기반 선택형', color: '#6C5CE7' },
  { icon: Clock, label: '5~7분', desc: '소요 시간', color: '#3B82F6' },
  { icon: Brain, label: 'RIASEC', desc: '6가지 유형 분석', color: '#22C55E' },
  { icon: Target, label: 'TOP 10', desc: '맞춤 직업 추천', color: '#FBBF24' },
];

const TIPS = [
  { icon: Lightbulb, text: '정답이 없어요. 편하게 골라주세요!' },
  { icon: Zap, text: '직감적으로 빠르게 선택하면 더 정확해요' },
  { icon: Shield, text: '솔직할수록 나에게 맞는 결과가 나와요' },
];

export default function QuizIntroPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(108,92,231,0.12) 0%, transparent 60%)' }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: 3 + Math.random() * 3,
            height: 3 + Math.random() * 3,
            left: `${15 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 80}%`,
            backgroundColor: '#6C5CE7',
            opacity: 0.2,
            animationDuration: `${3 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Header */}
      <div className="relative z-10 flex items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/onboarding')}
          className="text-white/50 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col px-5">
        {/* Hero icon */}
        <div
          className="flex flex-col items-center py-5"
          style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out' }}
        >
          <div className="relative mb-5">
            {/* Pulsing glow ring */}
            <div className="absolute -inset-4 rounded-full animate-pulse-glow" style={{ border: '2px solid rgba(108,92,231,0.2)' }} />
            <div
              className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center relative z-10"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                boxShadow: '0 0 40px rgba(108,92,231,0.4)',
              }}
            >
              <Brain className="w-10 h-10 text-white" />
            </div>
            {/* Orbiting sparkle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-orbit" style={{ animationDuration: '5s' }}>
                <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-extrabold mb-1.5">적성 검사</h1>
          <p className="text-sm text-white/50 text-center leading-relaxed">
            나의 숨겨진 재능을 깨워보세요
          </p>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 gap-3 mb-5"
          style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.15s' }}
        >
          {STAT_ITEMS.map((item) => (
            <div
              key={item.label}
              className="relative p-4 rounded-2xl overflow-hidden text-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="absolute inset-0 animate-shimmer" />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div className="font-bold text-lg" style={{ color: item.color }}>{item.label}</div>
              <div className="text-[11px] text-white/40 mt-0.5">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Reward preview */}
        <div
          className="p-4 rounded-2xl mb-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(59,130,246,0.1) 100%)',
            border: '1px solid rgba(108,92,231,0.2)',
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease-out 0.25s',
          }}
        >
          <div className="absolute inset-0 animate-shimmer" />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(251,191,36,0.15)' }}>
              <Sparkles className="w-5 h-5 text-[#FBBF24]" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">검사 완료 보상</div>
              <div className="text-xs text-white/40">+100 XP, RIASEC 유형 카드 획득</div>
            </div>
            <div className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FBBF2420', color: '#FBBF24' }}>
              +100 XP
            </div>
          </div>
        </div>

        {/* Tips */}
        <div
          className="space-y-2.5"
          style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.35s' }}
        >
          <div className="text-xs font-bold text-white/30 uppercase tracking-widest px-1 mb-2">
            Quest Tips
          </div>
          {TIPS.map((tip, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <tip.icon className="w-4 h-4 text-[#6C5CE7] flex-shrink-0" />
              <span className="text-sm text-white/60">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        className="relative z-10 px-5 pb-10 pt-5"
        style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease-out 0.45s' }}
      >
        <Button
          size="lg"
          className="w-full h-14 text-base font-bold rounded-2xl border-0 relative overflow-hidden transition-transform active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
            boxShadow: '0 8px 24px rgba(108,92,231,0.4)',
          }}
          onClick={() => router.push('/quiz')}
        >
          <span className="absolute inset-0 animate-shimmer" />
          <span className="relative flex items-center gap-2">
            퀘스트 시작 <Zap className="w-5 h-5" />
          </span>
        </Button>
        <p className="text-center text-[11px] text-white/30 mt-3">
          언제든 중단하고 이어서 할 수 있어요
        </p>
      </div>
    </div>
  );
}
