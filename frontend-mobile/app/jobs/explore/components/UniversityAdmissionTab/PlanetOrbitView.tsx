'use client';

import { useState, useEffect } from 'react';

type AdmissionCategory = {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  planet: {
    size: string;
    orbitRadius: number;
    orbitSpeed: number;
    glowColor: string;
  };
};

type PlanetOrbitViewProps = {
  categories: AdmissionCategory[];
  onSelectCategory: (category: AdmissionCategory) => void;
};

const PLANET_SIZES: Record<string, number> = {
  small: 44,
  medium: 54,
  large: 66,
};

const CENTER_X = 160;
const CENTER_Y = 160;

export function PlanetOrbitView({ categories, onSelectCategory }: PlanetOrbitViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [angles, setAngles] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    categories.forEach((cat, i) => {
      initial[cat.id] = (360 / categories.length) * i;
    });
    return initial;
  });

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setAngles((prev) => {
        const next: Record<string, number> = {};
        categories.forEach((cat, i) => {
          const speed = 360 / (cat.planet?.orbitSpeed ?? 20);
          const baseAngle = prev[cat.id] ?? (360 / categories.length) * i;
          const nextAngle = (baseAngle + speed * deltaTime) % 360;
          next[cat.id] = Number.isFinite(nextAngle) ? nextAngle : 0;
        });
        return next;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [categories]);

  const getPlanetPosition = (category: AdmissionCategory, angleDeg: number) => {
    const deg = Number.isFinite(angleDeg) ? angleDeg : 0;
    const rad = (deg * Math.PI) / 180;
    const orbitR = (category.planet?.orbitRadius ?? 100) * 0.75;
    return {
      x: CENTER_X + orbitR * Math.cos(rad),
      y: CENTER_Y + orbitR * Math.sin(rad),
    };
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      <div className="relative" style={{ width: 320, height: 320 }}>
        <svg
          width="320"
          height="320"
          className="absolute inset-0"
          style={{ overflow: 'visible' }}
        >
          {/* 궤도 원 */}
          {categories.map((cat) => {
            const orbitR = (cat.planet?.orbitRadius ?? 100) * 0.75;
            return (
              <ellipse
                key={`orbit-${cat.id}`}
                cx={CENTER_X}
                cy={CENTER_Y}
                rx={orbitR}
                ry={orbitR}
                fill="none"
                stroke={cat.color}
                strokeWidth="0.5"
                strokeDasharray="4 6"
                opacity="0.2"
              />
            );
          })}
        </svg>

        {/* 중심 별 */}
        <div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            left: CENTER_X - 28,
            top: CENTER_Y - 28,
            width: 56,
            height: 56,
            background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.1) 70%)',
            border: '2px solid rgba(251,191,36,0.5)',
            boxShadow: '0 0 24px rgba(251,191,36,0.4)',
            zIndex: 10,
          }}
        >
          <span className="text-2xl">⭐</span>
        </div>

        {/* 행성들 */}
        {categories.map((cat) => {
          const angle = angles[cat.id] ?? 0;
          const pos = getPlanetPosition(cat, angle);
          const size = PLANET_SIZES[cat.planet?.size ?? 'medium'] ?? 50;
          const isHovered = hoveredId === cat.id;
          const left = Number.isFinite(pos.x) ? pos.x - size / 2 : CENTER_X - size / 2;
          const top = Number.isFinite(pos.y) ? pos.y - size / 2 : CENTER_Y - size / 2;

          return (
            <button
              key={cat.id}
              className="absolute flex flex-col items-center justify-center rounded-full transition-transform"
              style={{
                left,
                top,
                width: size,
                height: size,
                background: cat.bgColor,
                border: `2px solid ${cat.color}`,
                boxShadow: isHovered
                  ? `0 0 20px ${cat.planet?.glowColor ?? cat.color}80, 0 0 40px ${cat.planet?.glowColor ?? cat.color}40`
                  : `0 0 10px ${cat.planet?.glowColor ?? cat.color}40`,
                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                zIndex: isHovered ? 20 : 5,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              onTouchStart={() => setHoveredId(cat.id)}
              onClick={() => onSelectCategory(cat)}
            >
              <span style={{ fontSize: size * 0.38 }}>{cat.emoji}</span>
            </button>
          );
        })}
      </div>

      {/* 행성 범례 */}
      <div className="w-full mt-2 grid grid-cols-2 gap-1.5 px-1">
        {categories.map((cat) => (
          <button
            key={`legend-${cat.id}`}
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all"
            style={{
              background: hoveredId === cat.id ? cat.bgColor : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hoveredId === cat.id ? cat.color : 'rgba(255,255,255,0.08)'}`,
            }}
            onMouseEnter={() => setHoveredId(cat.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectCategory(cat)}
          >
            <span className="text-base">{cat.emoji}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-white truncate">{cat.name}</p>
              <p className="text-[12px] truncate" style={{ color: cat.color }}>
                {cat.shortName}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
