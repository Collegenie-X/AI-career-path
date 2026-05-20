'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  { label: '적성 발견', color: '#3B82F6', emoji: '🧭' },
  { label: '커리어 탐색', color: '#A855F7', emoji: '🗺️' },
  { label: '패스 설계', color: '#22C55E', emoji: '🤖' },
  { label: '실행 계획', color: '#FBBF24', emoji: '⚡' },
  { label: '포트폴리오', color: '#EF4444', emoji: '🏅' },
];

export function JourneyFlowSVG() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <div className="w-full h-36" />;

  const totalW = 700;
  const cy = 70;
  const spacing = totalW / (STEPS.length + 1);

  return (
    <div className="w-full overflow-x-auto py-4">
      <svg viewBox={`0 0 ${totalW} 140`} className="w-full max-w-2xl mx-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="jf-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connecting path between nodes */}
        {STEPS.map((step, i) => {
          if (i === STEPS.length - 1) return null;
          const x1 = spacing * (i + 1) + 22;
          const x2 = spacing * (i + 2) - 22;
          const progress = (tick % 120) / 120;
          const dashOffset = -progress * 40;
          return (
            <g key={`conn-${i}`}>
              {/* Static faint line */}
              <line x1={x1} y1={cy} x2={x2} y2={cy}
                stroke={step.color} strokeOpacity={0.15} strokeWidth={2} />
              {/* Animated dashes */}
              <line x1={x1} y1={cy} x2={x2} y2={cy}
                stroke={step.color} strokeOpacity={0.6} strokeWidth={2}
                strokeDasharray="12 8"
                strokeDashoffset={dashOffset} />
              {/* Arrow head */}
              <polygon
                points={`${x2 + 2},${cy} ${x2 - 8},${cy - 5} ${x2 - 8},${cy + 5}`}
                fill={STEPS[i + 1].color} fillOpacity={0.7}
              />
            </g>
          );
        })}

        {/* Step nodes */}
        {STEPS.map((step, i) => {
          const cx = spacing * (i + 1);
          const phase = ((tick + i * 30) % 120) / 120;
          const float = Math.sin(phase * Math.PI * 2) * 5;
          const pulseR = 26 + Math.sin(phase * Math.PI * 2) * 4;

          return (
            <g key={step.label} transform={`translate(0, ${float})`} filter="url(#jf-glow)">
              {/* Outer glow pulse */}
              <circle cx={cx} cy={cy} r={pulseR} fill={step.color} fillOpacity={0.08} />
              {/* Main node */}
              <circle cx={cx} cy={cy} r={22} fill={step.color} fillOpacity={0.18}
                stroke={step.color} strokeOpacity={0.5} strokeWidth={1.5} />
              <circle cx={cx} cy={cy} r={18} fill={step.color} fillOpacity={0.9} />
              {/* Emoji */}
              <text x={cx} y={cy + 6} textAnchor="middle" fontSize="16"
                style={{ userSelect: 'none' }}>
                {step.emoji}
              </text>
              {/* Step number badge */}
              <circle cx={cx + 16} cy={cy - 16} r={9}
                fill="#0B0B16" stroke={step.color} strokeWidth={1.5} />
              <text x={cx + 16} y={cy - 12} textAnchor="middle" fontSize="9"
                fill={step.color} fontWeight="800">
                {i + 1}
              </text>
              {/* Label below */}
              <text x={cx} y={cy + 44} textAnchor="middle" fontSize="11"
                fill="white" fillOpacity={0.75} fontWeight="600">
                {step.label}
              </text>
            </g>
          );
        })}

        {/* Subtle sparks traveling along the path */}
        {STEPS.slice(0, -1).map((step, i) => {
          const x1 = spacing * (i + 1);
          const x2 = spacing * (i + 2);
          const progress = ((tick + i * 40) % 100) / 100;
          const sx = x1 + (x2 - x1) * progress;
          return (
            <circle key={`spark-${i}`} cx={sx} cy={cy} r={3}
              fill={step.color} fillOpacity={0.9}
              filter="url(#jf-glow)" />
          );
        })}
      </svg>
    </div>
  );
}
