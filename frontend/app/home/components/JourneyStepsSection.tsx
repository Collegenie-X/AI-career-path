'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

function JourneyStepCard({
  step,
  index,
  isActive,
  onClick,
}: {
  step: JourneyStep;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.65,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="flex-1 min-w-0"
    >
      <Link
        href={step.href}
        onClick={onClick}
        className="group relative w-full rounded-3xl p-6 border transition-all duration-400 cursor-pointer block"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${step.colorBg}, ${step.color}15)`
            : step.colorBg,
          borderColor: isActive ? step.color : step.colorBorder,
          boxShadow: isActive ? `0 0 40px ${step.glow}, 0 0 80px ${step.color}20` : 'none',
          transform: isActive ? 'translateY(-8px) scale(1.02)' : undefined,
        }}
      >
        {/* Animated background orb on active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${step.color}15 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Glow on hover */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `0 0 40px ${step.glow}` }}
        />

        {/* Active indicator top bar */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute top-0 left-4 right-4 h-0.5 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.4 }}
              style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }}
            />
          )}
        </AnimatePresence>

        {/* Header row: step badge + floating icons */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: isActive ? `${step.color}30` : `${step.color}20`,
              color: step.color,
            }}
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
        <motion.div
          className="text-5xl mb-3 text-center"
          animate={isActive ? { scale: [1, 1.1, 1], rotate: [-3, 3, -3] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: isActive ? `drop-shadow(0 0 12px ${step.color}80)` : undefined }}
        >
          {step.emoji}
        </motion.div>

        {/* Title + subtitle */}
        <h3 className="text-2xl font-extrabold text-white text-center mb-0.5">{step.title}</h3>
        <p className="text-xs text-center mb-4" style={{ color: step.color }}>
          {step.subtitle}
        </p>

        {/* Bullet list */}
        <div className="space-y-2 mb-5">
          {step.bullets.map((bullet, bi) => (
            <motion.div
              key={bullet}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/70"
              style={{ background: `${step.color}10` }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: bi * 0.05 }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: step.color }}
              />
              {bullet}
            </motion.div>
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
    </motion.div>
  );
}

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

export function JourneyStepsSection() {
  const { header, steps } = processSteps;
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={60} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />

      <div className="web-container relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {header.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{header.title}</h2>
          <p className="text-white/45 text-base max-w-md mx-auto">{header.subtitle}</p>
        </motion.div>

        {/* Progress step indicators (desktop) */}
        <motion.div
          className="hidden md:flex justify-center mb-10 gap-0"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {steps.map((step, i) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => setActiveStep(activeStep === i ? null : i)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300"
                  style={{
                    background: activeStep === i ? step.color : `${step.color}15`,
                    borderColor: step.color,
                    color: activeStep === i ? 'white' : step.color,
                    boxShadow: activeStep === i ? `0 0 16px ${step.color}60` : 'none',
                  }}
                >
                  {step.number}
                </div>
                <span className="text-[10px] text-white/40 group-hover:text-white/70 transition-colors">
                  {step.title}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div className="w-20 h-px mx-2 mb-5" style={{ background: `linear-gradient(90deg, ${step.color}40, ${steps[i + 1].color}40)` }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* Step cards */}
        <div className="flex flex-col md:flex-row items-start gap-0 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col md:flex-row items-center flex-1 min-w-0">
              <JourneyStepCard
                step={step}
                index={index}
                isActive={activeStep === index}
                onClick={() => setActiveStep(activeStep === index ? null : index)}
              />
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
