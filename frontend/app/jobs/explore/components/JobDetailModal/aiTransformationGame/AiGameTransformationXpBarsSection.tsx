'use client';

import { BarChart3 } from 'lucide-react';
import { AiFivePointScale } from '../AiFivePointScale';

interface AiGameTransformationXpBarsSectionProps {
  starColor: string;
  sectionTitle: string;
  replacementPressureTitle: string;
  replacementPressureHint: string;
  replacementPressure5: 1 | 2 | 3 | 4 | 5;
  pressureAnchorText: string;
  collaborationDesignTitle: string;
  collaborationDesignHint: string;
  collaborationDesign5: 1 | 2 | 3 | 4 | 5;
  collaborationAnchorText: string;
  scaleAxisLow: string;
  scaleAxisHigh: string;
}

export function AiGameTransformationXpBarsSection({
  starColor,
  sectionTitle,
  replacementPressureTitle,
  replacementPressureHint,
  replacementPressure5,
  pressureAnchorText,
  collaborationDesignTitle,
  collaborationDesignHint,
  collaborationDesign5,
  collaborationAnchorText,
  scaleAxisLow,
  scaleAxisHigh,
}: AiGameTransformationXpBarsSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: `${starColor}18`,
            border: `1px solid ${starColor}35`,
          }}
        >
          <BarChart3 className="h-4 w-4" style={{ color: starColor }} />
        </div>
        <h3 className="text-sm font-black text-white">{sectionTitle}</h3>
      </div>
      <AiFivePointScale
        title={replacementPressureTitle}
        hint={replacementPressureHint}
        value={replacementPressure5}
        anchorForValue={pressureAnchorText}
        accentColor="#f97316"
        lowLabel={scaleAxisLow}
        highLabel={scaleAxisHigh}
        visualVariant="game"
      />
      <AiFivePointScale
        title={collaborationDesignTitle}
        hint={collaborationDesignHint}
        value={collaborationDesign5}
        anchorForValue={collaborationAnchorText}
        accentColor={starColor}
        lowLabel={scaleAxisLow}
        highLabel={scaleAxisHigh}
        visualVariant="game"
      />
    </section>
  );
}
