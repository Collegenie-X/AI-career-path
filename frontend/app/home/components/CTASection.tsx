'use client';

import Link from 'next/link';
import { Rocket, ChevronRight } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const cta = homeContent.cta as typeof homeContent.cta;

export function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={100} />

      <div className="web-container relative z-10">
        <div
          className="relative rounded-3xl px-8 py-16 md:px-16 md:py-20 text-center overflow-hidden border"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(59,130,246,0.08) 100%)',
            borderColor: 'rgba(108,92,231,0.3)',
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-25 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, #6C5CE7, transparent)' }}
          />

          {['🌟', '⭐', '💫', '✨'].map((icon, i) => (
            <div
              key={i}
              className="absolute text-2xl opacity-30 pointer-events-none hidden md:block"
              style={{
                top: `${15 + i * 20}%`,
                left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
                right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined,
                animation: `icon-float ${3 + i * 0.6}s ease-in-out ${i * 0.5}s infinite`,
              }}
            >
              {icon}
            </div>
          ))}

          <div
            className="text-6xl mb-5 inline-block"
            style={{ animation: 'icon-float 4s ease-in-out infinite' }}
          >
            {cta.emoji}
          </div>

          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">{cta.badge}</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {cta.title}
          </h2>
          <p className="text-white/50 text-base mb-10 max-w-sm mx-auto">
            {cta.subtitle}
          </p>

          <Link
            href={cta.buttonHref}
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 active:scale-95 mb-10"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
              boxShadow: '0 8px 40px rgba(108,92,231,0.6)',
            }}
          >
            <Rocket className="w-5 h-5" />
            {cta.buttonLabel}
            <ChevronRight className="w-5 h-5 animate-arrow-bounce" />
          </Link>

          <div className="flex flex-wrap justify-center gap-3">
            {cta.trustItems.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/60"
              >
                <span className="text-base">{item.emoji}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
