'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Rocket, ArrowRight, ChevronRight } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const hero = homeContent.hero as typeof homeContent.hero & {
  rotatingDescriptions?: string[];
  rotatingDescriptionIntervalMs?: number;
};

export function HeroSectionLanding() {
  const rotatingLines = useMemo(
    () =>
      Array.isArray(hero.rotatingDescriptions) && hero.rotatingDescriptions.length > 0
        ? hero.rotatingDescriptions
        : [hero.description],
    []
  );
  const rotatingIntervalMs =
    typeof hero.rotatingDescriptionIntervalMs === 'number' ? hero.rotatingDescriptionIntervalMs : 5200;

  const [descriptionLineIndex, setDescriptionLineIndex] = useState(0);

  useEffect(() => {
    if (rotatingLines.length <= 1) return undefined;
    const timerId = window.setInterval(() => {
      setDescriptionLineIndex((previousIndex) => (previousIndex + 1) % rotatingLines.length);
    }, rotatingIntervalMs);
    return () => window.clearInterval(timerId);
  }, [rotatingLines.length, rotatingIntervalMs]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <StarfieldCanvas count={150} />

      {/* Floating decorative icons */}
      {hero.floatingIcons.map((icon, i) => (
        <div
          key={i}
          className={`absolute ${icon.size} select-none hidden md:block`}
          style={{
            top: icon.top,
            left: 'left' in icon ? icon.left : undefined,
            right: 'right' in icon ? icon.right : undefined,
            animation: `icon-float ${3 + i * 0.4}s ease-in-out ${icon.delay} infinite`,
            filter: 'drop-shadow(0 0 8px rgba(108,92,231,0.6))',
          }}
        >
          {icon.emoji}
        </div>
      ))}

      <div className="web-container relative z-10 py-28 md:py-36">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border"
            style={{ background: 'rgba(108,92,231,0.12)', borderColor: 'rgba(108,92,231,0.35)' }}>
            <span className="text-base">{hero.badge.emoji}</span>
            <span className="text-sm font-bold text-purple-300">{hero.badge.text}</span>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          {/* Main heading */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl md:text-5xl animate-icon-float" style={{ animationDelay: '0.3s' }}>{hero.heading.icons.line1[0]}</span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                {hero.heading.line1}
              </h1>
              <span className="text-4xl md:text-5xl animate-icon-float" style={{ animationDelay: '0.8s' }}>{hero.heading.icons.line1[1]}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl md:text-5xl animate-icon-float" style={{ animationDelay: '1.2s' }}>{hero.heading.icons.line2[0]}</span>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold bg-clip-text text-transparent leading-[1.05] tracking-tight"
                style={{ backgroundImage: 'linear-gradient(135deg, #a29bfe 0%, #6C5CE7 45%, #74b9ff 100%)' }}
              >
                {hero.heading.line2}
              </h1>
              <span className="text-4xl md:text-5xl animate-icon-float" style={{ animationDelay: '0.5s' }}>{hero.heading.icons.line2[1]}</span>
            </div>
          </div>

          {/* Short description — rotates from JSON for a more dynamic hero */}
          <div className="mb-10 max-w-xl mx-auto px-2">
            <div className="min-h-[4.5rem] md:min-h-[3.75rem] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={rotatingLines[descriptionLineIndex]}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45 }}
                  className="text-base md:text-lg text-white/50 text-center leading-relaxed"
                >
                  {rotatingLines[descriptionLineIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            {rotatingLines.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3" aria-hidden>
                {rotatingLines.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === descriptionLineIndex ? 'w-6 bg-purple-400/80' : 'w-1.5 bg-white/15'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href={hero.cta.primary.href}
              className="group flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-base text-white transition-all hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                boxShadow: '0 8px 40px rgba(108,92,231,0.55)',
              }}
            >
              <Rocket className="w-5 h-5" />
              {hero.cta.primary.label}
              <ChevronRight className="w-4 h-4 animate-arrow-bounce" />
            </Link>
            <Link
              href={hero.cta.secondary.href}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm text-white/60 border border-white/12 hover:border-white/28 hover:text-white transition-all w-full sm:w-auto justify-center"
            >
              {hero.cta.secondary.label}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Stat badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {hero.statBadges.map((b) => (
              <div
                key={b.value}
                className="flex flex-col items-center gap-1 rounded-2xl py-4 px-3 border transition-all hover:scale-105"
                style={{ background: `${b.color}10`, borderColor: `${b.color}30` }}
              >
                <span className="text-2xl">{b.emoji}</span>
                <span className="text-lg font-extrabold text-white leading-none">{b.value}</span>
                <span className="text-xs font-medium" style={{ color: b.color }}>{b.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30">
        <span className="text-xs tracking-widest uppercase">{hero.scrollLabel}</span>
        <div className="animate-arrow-bounce-down text-lg">↓</div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
}
