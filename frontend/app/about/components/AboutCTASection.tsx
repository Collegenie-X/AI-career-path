'use client';

import Link from 'next/link';
import { Rocket } from 'lucide-react';

export function AboutCTASection() {
  return (
    <section className="py-24 md:py-32">
      <div className="web-container">
        <div
          className="relative rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(59,130,246,0.08) 100%)',
            border: '1px solid rgba(108,92,231,0.25)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-25 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, #6C5CE7, transparent)' }}
          />

          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            함께 꿈을 만들어가요
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-md mx-auto">
            지금 바로 DreamPath를 시작하고, AI와 함께 나만의 진로를 설계해보세요.
          </p>

          <Link
            href="/quiz/intro"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-white transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
              boxShadow: '0 8px 32px rgba(108,92,231,0.5)',
            }}
          >
            <Rocket className="w-5 h-5" />
            무료로 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}
