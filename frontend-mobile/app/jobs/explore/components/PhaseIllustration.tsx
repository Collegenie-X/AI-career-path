'use client';

import { PHASE_BG_COLORS, LABELS } from '../config';
import type { WorkPhase } from '../types';

interface PhaseIllustrationProps {
  phase: WorkPhase;
  jobId: string;
  color: string;
}

export function PhaseIllustration({ phase, jobId, color }: PhaseIllustrationProps) {
  const bgGrad = PHASE_BG_COLORS[phase.id] ?? `linear-gradient(135deg, ${color}, ${color}88)`;

  return (
    <div
      className="w-full rounded-3xl flex flex-col items-center justify-center py-10 mb-5 relative overflow-hidden"
      style={{ background: bgGrad, minHeight: 200 }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
      <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-white/30" style={{ animation: 'twinkle 2s ease-in-out infinite' }} />
      <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-white/40" style={{ animation: 'twinkle 3s ease-in-out 1s infinite' }} />
      <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-white/20" style={{ animation: 'twinkle 2.5s ease-in-out 0.5s infinite' }} />

      {/* Big icon */}
      <div
        className="text-7xl mb-4 relative z-10"
        style={{ animation: 'float 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
      >
        {phase.icon}
      </div>

      {/* Phase badge */}
      <div className="relative z-10 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
        <span className="text-white font-bold text-sm">{phase.phase}</span>
      </div>

      {/* Step indicator */}
      <div className="absolute bottom-4 right-4 z-10">
        <span className="text-white/60 text-xs font-bold">{LABELS.modal_step} {phase.id}</span>
      </div>
    </div>
  );
}
