import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import { LABELS, MODE_ICONS } from '../config';
import type { QuizMode } from '../types';

interface ModeSelectScreenProps {
  onSelect: (mode: QuizMode) => void;
}

export function ModeSelectScreen({ onSelect }: ModeSelectScreenProps) {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}
    >
      <StarfieldCanvas count={100} />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent pointer-events-none" />

      <div className="web-container relative z-10 max-w-[600px] px-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 md:px-60 md:py-6">
        <div className="text-center mb-6 md:mb-7">
          <div className="text-3xl md:text-4xl mb-3 animate-icon-float">🌟</div>
          <h1 className="text-lg md:text-xl font-black text-white mb-2">
            {LABELS.mode_select_title}
          </h1>
          <p className="text-[11px] md:text-xs text-gray-400">
            {LABELS.mode_select_subtitle}
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {/* 빠른 모드 */}
          <button
            onClick={() => onSelect('10')}
            className="w-full rounded-2xl p-3.5 md:p-4 text-left relative overflow-hidden group transition-all hover:-translate-y-0.5 hover:scale-[1.01] active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2) 0%, rgba(108,92,231,0.08) 100%)',
              border: '2px solid rgba(108,92,231,0.4)',
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: '0 0 40px rgba(108,92,231,0.3)' }}
            />
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ background: 'rgba(108,92,231,0.25)' }}
              >
                {MODE_ICONS.quick}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm md:text-base font-black text-white">
                    {LABELS.mode_quick_title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300">
                    {LABELS.mode_quick_badge}
                  </span>
                </div>
                <p className="text-[10px] md:text-[11px] text-gray-400 mb-1.5">
                  {LABELS.mode_quick_desc}
                </p>
                <div className="flex gap-1">
                  {MODE_ICONS.zoneIcons.map((icon, i) => (
                    <span key={i} className="text-xs md:text-sm">{icon}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          {/* 정밀 모드 */}
          <button
            onClick={() => onSelect('30')}
            className="w-full rounded-2xl p-3.5 md:p-4 text-left relative overflow-hidden group transition-all hover:-translate-y-0.5 hover:scale-[1.01] active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(243,156,18,0.2) 0%, rgba(243,156,18,0.08) 100%)',
              border: '2px solid rgba(243,156,18,0.4)',
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ boxShadow: '0 0 40px rgba(243,156,18,0.3)' }}
            />
            <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{ background: 'rgba(243,156,18,0.3)', color: '#F39C12' }}
            >
              {LABELS.mode_recommended}
            </div>
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl flex-shrink-0 transition-transform group-hover:scale-105"
                style={{ background: 'rgba(243,156,18,0.25)' }}
              >
                {MODE_ICONS.detailed}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm md:text-base font-black text-white">
                    {LABELS.mode_detailed_title}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-yellow-500/20 text-yellow-300">
                    {LABELS.mode_detailed_badge}
                  </span>
                </div>
                <p className="text-[10px] md:text-[11px] text-gray-400 mb-1.5">
                  {LABELS.mode_detailed_desc}
                </p>
                <div className="flex gap-1 items-center">
                  {MODE_ICONS.zoneIcons.map((icon, i) => (
                    <span key={i} className="text-xs md:text-sm">{icon}</span>
                  ))}
                  <span className="text-[9px] text-gray-500 ml-1">× 6문항</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-[10px] md:text-[11px] text-gray-600">
          {LABELS.mode_tip}
        </p>
        </section>
      </div>
    </div>
  );
}
