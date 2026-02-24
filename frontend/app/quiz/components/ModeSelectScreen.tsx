import { LABELS, MODE_ICONS } from '../config';
import type { QuizMode } from '../types';

interface ModeSelectScreenProps {
  onSelect: (mode: QuizMode) => void;
}

export function ModeSelectScreen({ onSelect }: ModeSelectScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}>
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute rounded-full bg-white"
          style={{
            width: 1 + (i % 2),
            height: 1 + (i % 2),
            left: `${(i * 13 + 7) % 100}%`,
            top: `${(i * 17 + 5) % 100}%`,
            opacity: 0.2 + (i % 3) * 0.1,
            animation: `twinkle ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="text-2xl font-black text-white mb-2">{LABELS.mode_select_title}</h1>
          <p className="text-sm text-gray-400">{LABELS.mode_select_subtitle}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onSelect('10')}
            className="w-full rounded-3xl p-5 text-left relative overflow-hidden group transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2) 0%, rgba(108,92,231,0.08) 100%)',
              border: '1.5px solid rgba(108,92,231,0.4)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(108,92,231,0.25)' }}>
                {MODE_ICONS.quick}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">{LABELS.mode_quick_title}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300">
                    {LABELS.mode_quick_badge}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{LABELS.mode_quick_desc}</p>
                <div className="flex gap-1 mt-2">
                  {MODE_ICONS.zoneIcons.map((icon, i) => (
                    <span key={i} className="text-base">{icon}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('30')}
            className="w-full rounded-3xl p-5 text-left relative overflow-hidden group transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgba(243,156,18,0.2) 0%, rgba(243,156,18,0.08) 100%)',
              border: '1.5px solid rgba(243,156,18,0.4)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(243,156,18,0.25)' }}>
                {MODE_ICONS.detailed}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">{LABELS.mode_detailed_title}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300">
                    {LABELS.mode_detailed_badge}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{LABELS.mode_detailed_desc}</p>
                <div className="flex gap-1 mt-2">
                  {MODE_ICONS.zoneIcons.map((icon, i) => (
                    <span key={i} className="text-base">{icon}</span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1 self-center">× 6문항</span>
                </div>
              </div>
            </div>
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(243,156,18,0.3)', color: '#F39C12' }}>
              {LABELS.mode_recommended}
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          {LABELS.mode_tip}
        </p>
      </div>
    </div>
  );
}
