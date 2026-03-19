'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

type JourneyStep = {
  number: string;
  emoji: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
  icons: string[];
  color: string;
  colorBg: string;
  colorBorder: string;
  glow: string;
  bullets: string[];
};

const processSteps = homeContent.processSteps as {
  header: { badge: string; title: string; subtitle: string };
  steps: JourneyStep[];
};

function StepConnectorArrow({ color }: { color: string }) {
  return (
    <div className="hidden md:flex items-center justify-center w-10 shrink-0 mt-10">
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 border-r-2 border-t-2 rotate-45"
            style={{
              borderColor: color,
              opacity: 0.3 + i * 0.3,
              animation: `arrow-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function JourneyStepCard({ step, index }: { step: JourneyStep; index: number }) {
  return (
    <Link
      href={step.href}
      className="group relative w-full rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer block"
      style={{
        background: step.colorBg,
        borderColor: step.colorBorder,
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 40px ${step.glow}` }}
      />

      {/* Header row: step badge + floating icons */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${step.color}20`, color: step.color }}
        >
          STEP {step.number}
        </span>
        <div className="flex gap-1">
          {step.icons.map((icon, i) => (
            <span
              key={i}
              className="text-lg"
              style={{ animation: `icon-float ${2.5 + i * 0.5}s ease-in-out ${i * 0.4}s infinite` }}
            >
              {icon}
            </span>
          ))}
        </div>
      </div>

      {/* Main emoji */}
      <div
        className="text-5xl mb-3 text-center"
        style={{ animation: `icon-float 4s ease-in-out ${index * 0.3}s infinite` }}
      >
        {step.emoji}
      </div>

      {/* Title + subtitle */}
      <h3 className="text-2xl font-extrabold text-white text-center mb-0.5">{step.title}</h3>
      <p className="text-xs text-center mb-4" style={{ color: step.color }}>{step.subtitle}</p>

      {/* Bullet list */}
      <div className="space-y-2 mb-5">
        {step.bullets.map((bullet) => (
          <div
            key={bullet}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/70"
            style={{ background: `${step.color}10` }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: step.color }} />
            {bullet}
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group-hover:gap-3"
        style={{
          background: `${step.color}18`,
          color: step.color,
          border: `1px solid ${step.color}30`,
        }}
      >
        {step.ctaLabel}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }}
      />
    </Link>
  );
}

export function JourneyStepsSection() {
  const { header, steps } = processSteps;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={60} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />

      <div className="web-container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {header.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {header.title}
          </h2>
          <p className="text-white/45 text-base max-w-md mx-auto">
            {header.subtitle}
          </p>
        </div>

        {/* Step cards */}
        <div className="flex flex-col md:flex-row items-start gap-0 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col md:flex-row items-center flex-1 min-w-0">
              <JourneyStepCard step={step} index={index} />
              {index < steps.length - 1 && (
                <StepConnectorArrow color={steps[index + 1].color} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile connector dots */}
        <div className="md:hidden flex flex-col items-center gap-1 py-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 border-b-2 border-r-2 rotate-45"
              style={{
                borderColor: '#6C5CE7',
                opacity: 0.3 + i * 0.3,
                animation: `arrow-bounce-down 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
