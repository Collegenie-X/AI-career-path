'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Zap } from 'lucide-react';
import {
  HeroIcon,
  StatsGrid,
  RewardPreview,
  TipsList,
  BackgroundParticles,
} from './components';
import { STAT_ITEMS, TIPS, LABELS, ROUTES } from './config';

export default function QuizIntroPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative">
      <BackgroundParticles />

      <div className="relative z-10 flex items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(ROUTES.back)}
          className="text-white/50 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-5">
        <div
          className="flex flex-col items-center py-5"
          style={{ 
            opacity: show ? 1 : 0, 
            transform: show ? 'translateY(0)' : 'translateY(20px)', 
            transition: 'all 0.6s ease-out' 
          }}
        >
          <HeroIcon />
          <h1 className="text-2xl font-extrabold mb-1.5">{LABELS.title}</h1>
          <p className="text-sm text-white/50 text-center leading-relaxed">
            {LABELS.subtitle}
          </p>
        </div>

        <StatsGrid items={STAT_ITEMS} show={show} />
        <RewardPreview show={show} />
        <TipsList tips={TIPS} show={show} />
      </div>

      <div
        className="relative z-10 px-5 pb-10 pt-5"
        style={{ 
          opacity: show ? 1 : 0, 
          transform: show ? 'translateY(0)' : 'translateY(20px)', 
          transition: 'all 0.6s ease-out 0.45s' 
        }}
      >
        <Button
          size="lg"
          className="w-full h-14 text-base font-bold rounded-2xl border-0 relative overflow-hidden transition-transform active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
            boxShadow: '0 8px 24px rgba(108,92,231,0.4)',
          }}
          onClick={() => router.push(ROUTES.quiz)}
        >
          <span className="absolute inset-0 animate-shimmer" />
          <span className="relative flex items-center gap-2">
            {LABELS.cta_button} <Zap className="w-5 h-5" />
          </span>
        </Button>
        <p className="text-center text-[11px] text-white/30 mt-3">
          {LABELS.cta_note}
        </p>
      </div>
    </div>
  );
}
