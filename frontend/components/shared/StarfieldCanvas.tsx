'use client';

import { useMemo, useState, useEffect } from 'react';

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

/** 서버/클라이언트 동일 문자열 보장 (hydration mismatch 방지) */
function toFixed4(n: number): string {
  return n.toFixed(4);
}

type StarfieldCanvasProps = {
  count?: number;
  className?: string;
};

export function StarfieldCanvas({
  count = 80,
  className = '',
}: StarfieldCanvasProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: seededRandom(i * 3) * 100,
        top: seededRandom(i * 7 + 1) * 100,
        size: 0.8 + seededRandom(i * 5 + 2) * 1.8,
        delay: seededRandom(i * 11 + 3) * 8,
        duration: 3 + seededRandom(i * 13 + 4) * 6,
        opacity: 0.15 + seededRandom(i * 17 + 5) * 0.55,
        color:
          seededRandom(i * 19 + 6) > 0.8
            ? '#c4b5fd'
            : seededRandom(i * 23 + 7) > 0.85
            ? '#93c5fd'
            : seededRandom(i * 29 + 8) > 0.92
            ? '#818cf8'
            : 'rgba(255,255,255,0.9)',
      })),
    [count]
  );

  if (!mounted) {
    return <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden />;
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      {/* Stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${toFixed4(s.left)}%`,
            top: `${toFixed4(s.top)}%`,
            width: `${toFixed4(s.size)}px`,
            height: `${toFixed4(s.size)}px`,
            background: s.color,
            opacity: parseFloat(toFixed4(s.opacity)),
            animation: `twinkle ${toFixed4(s.duration)}s ease-in-out ${toFixed4(s.delay)}s infinite`,
          }}
        />
      ))}

      {/* Galaxy core glow — 중심 은하빛 */}
      <div
        className="absolute rounded-full blur-[140px]"
        style={{
          width: '70vw',
          height: '50vh',
          top: '20%',
          left: '15%',
          background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.07) 45%, transparent 75%)',
          animation: 'nebula-drift 35s ease-in-out infinite',
        }}
      />

      {/* Left nebula — 보라빛 성운 */}
      <div
        className="absolute rounded-full blur-[110px]"
        style={{
          width: '45vw',
          height: '55vh',
          top: '5%',
          left: '-5%',
          background: 'radial-gradient(ellipse, rgba(167,139,250,0.10) 0%, transparent 70%)',
          animation: 'nebula-drift 28s ease-in-out 3s infinite',
        }}
      />

      {/* Right nebula — 인디고/파랑빛 성운 */}
      <div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: '40vw',
          height: '50vh',
          bottom: '5%',
          right: '-5%',
          background: 'radial-gradient(ellipse, rgba(96,165,250,0.09) 0%, transparent 70%)',
          animation: 'nebula-drift 32s ease-in-out 8s infinite',
        }}
      />

      {/* Subtle milky way band */}
      <div
        className="absolute blur-[80px]"
        style={{
          width: '100%',
          height: '30vh',
          top: '35%',
          left: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(129,140,248,0.05) 25%, rgba(167,139,250,0.07) 50%, rgba(129,140,248,0.05) 75%, transparent 100%)',
          animation: 'nebula-drift 45s ease-in-out 12s infinite',
        }}
      />
    </div>
  );
}
