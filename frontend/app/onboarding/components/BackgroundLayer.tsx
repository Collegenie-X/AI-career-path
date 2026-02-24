'use client';

import { PARTICLE_CONFIG } from '../config';

interface BackgroundLayerProps {
  color: string;
  slideIndex: number;
}

// 결정론적 파티클 위치 (Math.random 대신 index 기반)
function getParticleStyle(i: number, color: string) {
  const left   = ((i * 137.5) % 80) + 10;
  const top    = ((i * 97.3)  % 80) + 10;
  const size   = PARTICLE_CONFIG.minSize + (i % 4);
  const opacity = PARTICLE_CONFIG.minOpacity + (i % 3) * 0.07;
  const duration = PARTICLE_CONFIG.minDuration + (i % 4);
  const delay  = (i * 0.3) % 2;

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: size,
    height: size,
    backgroundColor: color,
    opacity,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
  };
}

export function BackgroundLayer({ color, slideIndex }: BackgroundLayerProps) {
  return (
    <>
      {/* Radial gradient */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, ${color}22 0%, transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: PARTICLE_CONFIG.count }).map((_, i) => (
        <div
          key={`p-${slideIndex}-${i}`}
          className="absolute rounded-full animate-float"
          style={getParticleStyle(i, color)}
        />
      ))}
    </>
  );
}
