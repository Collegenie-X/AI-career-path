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
  count = 120,
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
        size: 1 + seededRandom(i * 5 + 2) * 2.5,
        delay: seededRandom(i * 11 + 3) * 7,
        duration: 2 + seededRandom(i * 13 + 4) * 5,
        opacity: 0.25 + seededRandom(i * 17 + 5) * 0.75,
        // 일부 별은 색상 있음
        color:
          seededRandom(i * 19 + 6) > 0.85
            ? '#a29bfe'
            : seededRandom(i * 23 + 7) > 0.9
            ? '#74b9ff'
            : 'white',
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
      {/* Stars - 클라이언트 전용 렌더링으로 hydration mismatch 방지 */}
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

      {/* Nebula glows */}
      <div
        className="absolute w-[600px] h-[400px] rounded-full opacity-10 blur-[100px]"
        style={{
          top: '10%',
          left: '5%',
          background: 'radial-gradient(ellipse, #6C5CE7, transparent)',
          animation: 'nebula-drift 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[500px] h-[350px] rounded-full opacity-8 blur-[90px]"
        style={{
          bottom: '10%',
          right: '5%',
          background: 'radial-gradient(ellipse, #3B82F6, transparent)',
          animation: 'nebula-drift 30s ease-in-out 5s infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[300px] rounded-full opacity-6 blur-[80px]"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(ellipse, #A855F7, transparent)',
          animation: 'nebula-drift 20s ease-in-out 10s infinite',
        }}
      />
    </div>
  );
}
