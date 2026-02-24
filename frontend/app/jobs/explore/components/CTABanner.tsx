'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { LABELS } from '../config';
import type { StarData } from '../types';

interface CTABannerProps {
  star: StarData;
}

export function CTABanner({ star }: CTABannerProps) {
  const router = useRouter();

  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-2.5"
      style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(108,92,231,0.1))', border: '1.5px solid rgba(108,92,231,0.35)' }}
    >
      <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center flex-shrink-0">
        <ArrowRight className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-white">{LABELS.cta_title}</div>
        <div className="text-xs text-gray-400">{LABELS.cta_description}</div>
      </div>
      <button
        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
        style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}
        onClick={() => router.push(`/career?star=${star.id}`)}
      >
        {LABELS.cta_button}
      </button>
    </div>
  );
}
