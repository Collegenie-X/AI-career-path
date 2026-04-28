'use client';

import { BookOpen } from 'lucide-react';
import { LABELS } from '../config';

export function IntroBanner() {
  return (
    <div
      className="rounded-2xl p-3.5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.3) 0%, rgba(59,130,246,0.2) 100%)', border: '2px solid rgba(108,92,231,0.4)' }}
    >
      <div className="absolute top-2 right-3 text-5xl opacity-10">🌌</div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <BookOpen className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          {LABELS.intro_banner_title}
        </span>
      </div>
      <p className="text-sm text-white font-semibold mb-0.5">
        {LABELS.intro_banner_subtitle}
      </p>
      <p className="text-xs text-gray-300 leading-relaxed">
        진짜 직장에서 하는 <span className="text-white font-bold">일</span>과{' '}
        <span className="text-white font-bold">성장 루트</span>를 게임처럼 따라가 봐요 — 부담 없이 둘러봐요!
      </p>
    </div>
  );
}
