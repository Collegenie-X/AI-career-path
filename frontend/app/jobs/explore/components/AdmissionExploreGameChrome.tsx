'use client';

import { motion } from 'framer-motion';

import admissionExploreGameUi from '@/data/jobs-explore/admission-explore-game-ui.json';

export type AdmissionExploreGameVariant = 'highSchool' | 'university';

const HUD_COPY = {
  highSchool: admissionExploreGameUi.highSchool,
  university: admissionExploreGameUi.university,
} as const;

/** 우주 느낌의 배경 오브 (고입/대입 탭 전용) */
export function AdmissionExploreCosmicBackdrop({ variant }: { readonly variant: AdmissionExploreGameVariant }) {
  const isHs = variant === 'highSchool';
  const primary = isHs ? '139,92,246' : '99,102,241';
  const secondary = isHs ? '34,197,94' : '20,184,166';

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <motion.div
        className="absolute -top-16 -left-12 h-48 w-48 rounded-full blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, rgba(${primary},0.45) 0%, transparent 72%)`,
        }}
        animate={{ x: [0, 14, 0], y: [0, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full blur-3xl opacity-45"
        style={{
          background: `radial-gradient(circle, rgba(${secondary},0.4) 0%, transparent 70%)`,
        }}
        animate={{ x: [0, -12, 0], y: [0, -8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl opacity-30"
        style={{
          background: `radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 68%)`,
        }}
        animate={{ opacity: [0.22, 0.38, 0.22], scale: [0.92, 1.05, 0.92] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

/** RPG 스타일 미션 배너 (문구는 JSON) */
export function AdmissionGameHudBanner({ variant }: { readonly variant: AdmissionExploreGameVariant }) {
  const copy = HUD_COPY[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="relative mb-2 overflow-hidden rounded-2xl border px-3 py-2.5"
      style={{
        borderColor: 'rgba(255,255,255,0.14)',
        background:
          'linear-gradient(125deg, rgba(15,23,42,0.92) 0%, rgba(30,27,75,0.55) 45%, rgba(15,23,42,0.88) 100%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            'repeating-linear-gradient(-12deg, transparent, transparent 6px, rgba(255,255,255,0.5) 6px, rgba(255,255,255,0.5) 7px)',
        }}
        animate={{ x: [0, 8] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
      />
      <div className="relative flex flex-wrap items-center gap-2">
        <span
          className="rounded-md border px-2 py-0.5 text-[10px] font-black tracking-widest text-fuchsia-100"
          style={{
            background: 'linear-gradient(135deg, rgba(217,70,239,0.35), rgba(168,85,247,0.25))',
            borderColor: 'rgba(232,121,249,0.45)',
            boxShadow: '0 0 18px rgba(217,70,239,0.25)',
          }}
        >
          {copy.hudBadge}
        </span>
        <span className="text-sm font-black tracking-tight text-white">{copy.hudTitle}</span>
      </div>
      <p className="relative mt-1.5 text-[11px] leading-relaxed text-white/65">{copy.hudSubtitle}</p>
      <p className="relative mt-1 text-[10px] font-bold text-amber-200/95">{copy.questHint}</p>
    </motion.div>
  );
}

export function admissionExploreOrbitCallout(variant: AdmissionExploreGameVariant): string {
  return HUD_COPY[variant].orbitCallout;
}
