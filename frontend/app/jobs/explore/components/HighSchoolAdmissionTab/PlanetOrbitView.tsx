'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { HighSchoolCategory } from '../../types';

type PlanetOrbitViewProps = {
  categories: HighSchoolCategory[];
  onSelectCategory: (category: HighSchoolCategory) => void;
  selectedCategoryId?: string | null;
};

const PLANET_SIZES: Record<string, number> = {
  small: 44,
  medium: 54,
  large: 66,
};

const CENTER_X = 160;
const CENTER_Y = 160;

export function PlanetOrbitView({ categories, onSelectCategory, selectedCategoryId = null }: PlanetOrbitViewProps) {
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

  const getPlanetPosition = (category: HighSchoolCategory, angleDeg: number) => {
    const deg = Number.isFinite(angleDeg) ? angleDeg : 0;
    const rad = (deg * Math.PI) / 180;
    const orbitR = (category.planet?.orbitRadius ?? 100) * 0.75;
    // 정수 픽셀로 고정 — SSR/CSR 직렬화 차이로 인한 hydration mismatch 방지
    return {
      x: Math.round(CENTER_X + orbitR * Math.cos(rad)),
      y: Math.round(CENTER_Y + orbitR * Math.sin(rad)),
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
        {categories.map((cat, legendIndex) => {
          const isSelected = selectedCategoryId === cat.id;
          const isActive = isSelected || hoveredId === cat.id;
          return (
          <motion.button
            key={`legend-${cat.id}`}
            type="button"
            aria-pressed={isSelected}
            className="relative flex items-center gap-2 px-2.5 py-2 rounded-xl text-left"
            style={{
              background: isActive ? cat.bgColor : 'rgba(255,255,255,0.04)',
              border: `${isSelected ? 2 : 1}px solid ${isActive ? cat.color : 'rgba(255,255,255,0.08)'}`,
              boxShadow: isSelected
                ? `0 0 0 2px ${cat.color}55, 0 0 16px ${cat.planet?.glowColor ?? cat.color}66`
                : undefined,
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
            {isSelected && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-6 w-1 rounded-r"
                style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}` }}
              />
            )}
            <span className="text-xl">{cat.emoji}</span>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-bold truncate"
                style={{ color: isSelected ? cat.color : '#ffffff' }}
              >
                {cat.name}
              </p>
              <p className="text-sm truncate" style={{ color: cat.color }}>
                {cat.schools.length}개 학교
              </p>
            </div>
          </motion.button>
          );
        })}
      </div>
    </div>
  );
}
