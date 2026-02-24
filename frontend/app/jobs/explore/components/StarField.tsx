'use client';

import { STAR_FIELD_CONFIG } from '../config';

export function StarField() {
  const stars = Array.from({ length: STAR_FIELD_CONFIG.starCount }, (_, i) => ({
    id: i,
    x: ((i * STAR_FIELD_CONFIG.xMultiplier) % 100),
    y: ((i * STAR_FIELD_CONFIG.yMultiplier) % 100),
    size: (i % STAR_FIELD_CONFIG.sizeVariation) + 1,
    delay: (i * STAR_FIELD_CONFIG.delayMultiplier) % STAR_FIELD_CONFIG.delayMod,
    dur: STAR_FIELD_CONFIG.durationBase + (i % STAR_FIELD_CONFIG.durationVariation),
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.25,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
