'use client';

import { Gem, Scroll, Shield } from 'lucide-react';
import { AI_ERA_GAME_UI_LABELS } from '../../../config/aiEraGameUiLabels';

const SURVIVAL_ICONS = [Shield, Scroll, Gem] as const;

interface AiGameTransformationToolsAndSurvivalProps {
  starColor: string;
  mainToolsTitle: string;
  survivalTitle: string;
  aiTools: string[];
  survivalStrategy: string[];
}

export function AiGameTransformationToolsAndSurvival({
  starColor,
  mainToolsTitle,
  survivalTitle,
  aiTools,
  survivalStrategy,
}: AiGameTransformationToolsAndSurvivalProps) {
  const showTools = aiTools.length > 0;
  const showSurvival = survivalStrategy.length > 0;
  if (!showTools && !showSurvival) return null;

  return (
    <>
      {showTools && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Gem className="h-4 w-4" style={{ color: starColor }} />
            <div>
              <h3 className="text-sm font-black text-white">{mainToolsTitle}</h3>
              <p className="text-[10px] text-gray-500">{AI_ERA_GAME_UI_LABELS.jobModalGearLockerSubtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiTools.map((tool, idx) => (
              <div
                key={`${tool}-${idx}`}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
                style={{
                  background: `linear-gradient(135deg, ${starColor}20, rgba(0,0,0,0.45))`,
                  border: `1px solid ${starColor}38`,
                  color: '#fff',
                  boxShadow: `0 4px 16px ${starColor}14`,
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-black text-white/90"
                  style={{ background: `${starColor}35` }}
                >
                  {idx + 1}
                </span>
                {tool}
              </div>
            ))}
          </div>
        </section>
      )}

      {showSurvival && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" style={{ color: starColor }} />
            <h3 className="text-sm font-black text-white">{survivalTitle}</h3>
          </div>
          <div className="space-y-2">
            {survivalStrategy.map((strategy, idx) => {
              const Ico = SURVIVAL_ICONS[idx % SURVIVAL_ICONS.length];
              return (
                <div
                  key={`${strategy.slice(0, 20)}-${idx}`}
                  className="flex gap-2 overflow-hidden rounded-2xl"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.05), rgba(0,0,0,0.4))',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="flex w-12 flex-shrink-0 flex-col items-center justify-center gap-1 py-2"
                    style={{
                      background: `linear-gradient(180deg, ${starColor}50, ${starColor}18)`,
                    }}
                  >
                    <Ico className="h-4 w-4 text-white" />
                    <span className="text-[9px] font-black text-white/90">+{idx + 1}XP</span>
                  </div>
                  <p className="flex flex-1 items-center py-3 pr-3 text-sm leading-relaxed text-gray-200">
                    {strategy}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
