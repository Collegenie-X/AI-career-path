'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
                className="admission-orbit-ellipse"
                cx={CENTER_X}
                cy={CENTER_Y}
                rx={orbitR}
                ry={orbitR}
                fill="none"
                stroke={cat.color}
                strokeWidth="0.5"
                strokeDasharray="4 6"
                strokeDashoffset={0}
                opacity="0.28"
              />
            );
          })}
        </svg>

        {/* 중심 별 — 보스 존 느낌 펄스 */}
        <motion.div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            left: CENTER_X - 28,
            top: CENTER_Y - 28,
            width: 56,
            height: 56,
            background: 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0.08) 72%)',
            border: '2px solid rgba(251,191,36,0.55)',
            boxShadow: '0 0 28px rgba(251,191,36,0.45)',
            zIndex: 10,
          }}
          animate={{
            scale: [1, 1.09, 1],
            boxShadow: [
              '0 0 22px rgba(251,191,36,0.35)',
              '0 0 36px rgba(251,191,36,0.55)',
              '0 0 22px rgba(251,191,36,0.35)',
            ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 14, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ display: 'block' }}
          >
            ⭐
          </motion.span>
        </motion.div>

        {/* 행성들 */}
        {categories.map((cat, planetIndex) => {
          const angle = angles[cat.id] ?? 0;
          const pos = getPlanetPosition(cat, angle);
          const size = PLANET_SIZES[cat.planet?.size ?? 'medium'] ?? 50;
          const isHovered = hoveredId === cat.id;
          const left = Number.isFinite(pos.x) ? pos.x - size / 2 : CENTER_X - size / 2;
          const top = Number.isFinite(pos.y) ? pos.y - size / 2 : CENTER_Y - size / 2;

          return (
            <motion.button
              key={cat.id}
              type="button"
              className="absolute flex flex-col items-center justify-center rounded-full cursor-pointer"
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
                zIndex: isHovered ? 20 : 5,
              }}
              onMouseEnter={() => setHoveredId(cat.id)}
              onMouseLeave={() => setHoveredId(null)}
              onTouchStart={() => setHoveredId(cat.id)}
              onClick={() => onSelectCategory(cat)}
              whileHover={{ scale: 1.16 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            >
              <motion.span
                style={{ fontSize: size * 0.38 }}
                animate={{ y: [0, -2, 0] }}
                transition={{
                  duration: 2.2 + (planetIndex % 4) * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: planetIndex * 0.08,
                }}
              >
                {cat.emoji}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* 행성 범례 */}
      <div className="w-full mt-2 grid grid-cols-2 gap-1.5 px-1">
        {categories.map((cat, legendIndex) => (
          <motion.button
            key={`legend-${cat.id}`}
            type="button"
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left"
            style={{
              background: hoveredId === cat.id ? cat.bgColor : 'rgba(255,255,255,0.04)',
              border: `1px solid ${hoveredId === cat.id ? cat.color : 'rgba(255,255,255,0.08)'}`,
            }}
            onMouseEnter={() => setHoveredId(cat.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => onSelectCategory(cat)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: legendIndex * 0.04, type: 'spring', stiffness: 380, damping: 28 }}
            whileHover={{ scale: 1.02, x: 3 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-base">{cat.emoji}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-white truncate">{cat.name}</p>
              <p className="text-[12px] truncate" style={{ color: cat.color }}>
                {cat.shortName}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
