'use client';

import { ArrowDown, ArrowRight, Sparkles, Timer } from 'lucide-react';
import { AI_ERA_GAME_UI_LABELS } from '../../../config/aiEraGameUiLabels';

interface AiGameTransformationEvolutionCardsProps {
  starColor: string;
  beforeAI: string;
  afterAI: string;
  sectionTitle: string;
}

export function AiGameTransformationEvolutionCards({
  starColor,
  beforeAI,
  afterAI,
  sectionTitle,
}: AiGameTransformationEvolutionCardsProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: starColor }} />
        <h3 className="text-sm font-black text-white">{sectionTitle}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.45))',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-300">
            <Timer className="h-3 w-3" />
            {AI_ERA_GAME_UI_LABELS.jobModalEvolutionBeforeLabel}
          </div>
          <p className="text-sm leading-relaxed text-gray-300">{beforeAI}</p>
        </div>

        <div className="flex items-center justify-center py-1 sm:py-0">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12"
            style={{
              background: `${starColor}25`,
              border: `2px solid ${starColor}`,
              boxShadow: `0 0 24px ${starColor}40`,
            }}
          >
            <ArrowDown className="h-5 w-5 text-white sm:hidden" />
            <ArrowRight className="hidden h-5 w-5 text-white sm:block" />
          </div>
        </div>

        <div
          className="rounded-2xl p-4 sm:col-span-1"
          style={{
            background: `linear-gradient(155deg, ${starColor}22, rgba(0,0,0,0.5))`,
            border: `1px solid ${starColor}45`,
            boxShadow: `0 12px 40px ${starColor}18`,
          }}
        >
          <div
            className="mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              background: `${starColor}35`,
              color: '#fff',
            }}
          >
            <Sparkles className="h-3 w-3" />
            {AI_ERA_GAME_UI_LABELS.jobModalEvolutionAfterLabel}
          </div>
          <p className="text-sm font-medium leading-relaxed text-white">{afterAI}</p>
        </div>
      </div>
    </section>
  );
}
