'use client';

import { useEffect, useState } from 'react';

export function HeroCareerSVG() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <div className="w-full min-h-[480px]" />;

  return (
    <div className="relative w-full h-full min-h-[480px] flex items-center justify-center select-none">
      <svg
        viewBox="0 0 480 520"
        className="w-full max-w-[480px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="hero-glow-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rocket-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6C5CE7" />
          </linearGradient>
          <linearGradient id="path-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#6C5CE7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="orbit-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0" />
            <stop offset="50%" stopColor="#6C5CE7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
          </linearGradient>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="card-clip">
            <rect x="0" y="0" width="480" height="520" rx="24" />
          </clipPath>
        </defs>

        {/* Background ambient glows */}
        <ellipse cx="240" cy="260" rx="180" ry="160" fill="url(#hero-glow-purple)" />
        <ellipse cx="380" cy="120" rx="80" ry="70" fill="url(#hero-glow-blue)" />
        <ellipse cx="100" cy="420" rx="70" ry="60" fill="url(#hero-glow-green)" />

        {/* Subtle grid lines */}
        {[0,1,2,3,4,5,6].map((i) => (
          <line key={`hg-${i}`} x1={i*80} y1="0" x2={i*80} y2="520"
            stroke="#6C5CE7" strokeOpacity="0.04" strokeWidth="1" />
        ))}
        {[0,1,2,3,4,5,6].map((i) => (
          <line key={`vg-${i}`} x1="0" y1={i*90} x2="480" y2={i*90}
            stroke="#6C5CE7" strokeOpacity="0.04" strokeWidth="1" />
        ))}

        {/* === Career path curve (bottom to top) === */}
        <path
          d="M 120 460 C 100 380, 200 360, 180 280 C 160 200, 280 180, 260 100"
          stroke="url(#path-gradient)"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="8 5"
          style={{ animation: 'dashMove 3s linear infinite' }}
        />

        {/* === Milestone Nodes === */}
        {/* Node 1: Start - 적성검사 */}
        <MilestoneNode
          x={120} y={460}
          color="#3B82F6"
          glow="url(#hero-glow-blue)"
          label="적성 발견"
          emoji="🧭"
          tick={tick}
          delay={0}
        />

        {/* Node 2: 커리어 탐색 */}
        <MilestoneNode
          x={180} y={280}
          color="#FBBF24"
          glow="url(#hero-glow-purple)"
          label="커리어 탐색"
          emoji="🗺️"
          tick={tick}
          delay={20}
        />

        {/* Node 3: AI 패스 설계 */}
        <MilestoneNode
          x={260} y={100}
          color="#22C55E"
          glow="url(#hero-glow-green)"
          label="AI 설계"
          emoji="🤖"
          tick={tick}
          delay={40}
        />

        {/* === Floating Career Cards === */}
        <CareerCard x={290} y={240} title="데이터 사이언티스트" color="#6C5CE7" tick={tick} delay={0} />
        <CareerCard x={310} y={360} title="UX 디자이너" color="#3B82F6" tick={tick} delay={30} />
        <CareerCard x={50} y={180} title="AI 엔지니어" color="#22C55E" tick={tick} delay={15} />

        {/* === Rocket === */}
        <Rocket tick={tick} />

        {/* === Orbiting AI Brain === */}
        <AIOrbit tick={tick} />

        {/* === Sparkle particles === */}
        {[
          { x: 60, y: 90, d: 0 },
          { x: 420, y: 180, d: 15 },
          { x: 350, y: 460, d: 8 },
          { x: 90, y: 350, d: 25 },
          { x: 440, y: 320, d: 35 },
          { x: 200, y: 50, d: 42 },
        ].map((s, i) => (
          <Sparkle key={i} x={s.x} y={s.y} tick={tick} delay={s.d} />
        ))}

        {/* === Stat pills floating === */}
        <StatPill x={320} y={60} label="200+ 커리어" color="#a78bfa" tick={tick} delay={10} />
        <StatPill x={30} y={270} label="무료 시작" color="#22C55E" tick={tick} delay={28} />
      </svg>

      {/* CSS keyframes for SVG dash animation */}
      <style>{`
        @keyframes dashMove {
          to { stroke-dashoffset: -26; }
        }
      `}</style>
    </div>
  );
}

function MilestoneNode({ x, y, color, label, emoji, tick, delay }: {
  x: number; y: number; color: string; glow: string;
  label: string; emoji: string; tick: number; delay: number;
}) {
  const phase = ((tick + delay) % 120) / 120;
  const float = Math.sin(phase * Math.PI * 2) * 5;
  const pulse = 0.6 + Math.sin(phase * Math.PI * 2) * 0.4;

  return (
    <g transform={`translate(0, ${float})`} filter="url(#glow-soft)">
      {/* Outer pulse ring */}
      <circle cx={x} cy={y} r={22 + pulse * 8} fill={color} fillOpacity={0.08 * pulse} />
      <circle cx={x} cy={y} r={18} fill={color} fillOpacity={0.12} />
      {/* Main circle */}
      <circle cx={x} cy={y} r={14} fill={color} fillOpacity={0.9} />
      <circle cx={x} cy={y} r={12} fill={color} />
      {/* Emoji */}
      <text x={x} y={y + 5} textAnchor="middle" fontSize="13" style={{ userSelect: 'none' }}>
        {emoji}
      </text>
      {/* Label */}
      <rect x={x - 30} y={y + 18} width={60} height={18} rx="9"
        fill={color} fillOpacity={0.15} />
      <text x={x} y={y + 30} textAnchor="middle" fontSize="9" fill={color} fontWeight="700">
        {label}
      </text>
    </g>
  );
}

function CareerCard({ x, y, title, color, tick, delay }: {
  x: number; y: number; title: string; color: string; tick: number; delay: number;
}) {
  const phase = ((tick + delay) % 160) / 160;
  const float = Math.sin(phase * Math.PI * 2) * 6;
  const w = 130;
  const h = 36;

  return (
    <g transform={`translate(0, ${float})`}>
      <rect x={x} y={y} width={w} height={h} rx="10"
        fill={color} fillOpacity={0.1}
        stroke={color} strokeOpacity={0.3} strokeWidth="1" />
      <rect x={x + 8} y={y + 11} width={8} height={8} rx="2" fill={color} fillOpacity={0.8} />
      <text x={x + 22} y={y + 21} fontSize="9.5" fill="white" fillOpacity={0.8} fontWeight="600">
        {title}
      </text>
    </g>
  );
}

function Rocket({ tick }: { tick: number }) {
  const phase = (tick % 200) / 200;
  const yOff = Math.sin(phase * Math.PI * 2) * 8;
  const xOff = Math.sin(phase * Math.PI * 4) * 3;
  const cx = 240, cy = 200;

  return (
    <g transform={`translate(${cx + xOff}, ${cy + yOff}) rotate(-45)`} filter="url(#glow-strong)">
      {/* Rocket exhaust trail */}
      <ellipse cx={0} cy={38} rx={5} ry={14}
        fill="#FBBF24" fillOpacity={0.35 + Math.sin(phase * Math.PI * 6) * 0.2} />
      <ellipse cx={0} cy={32} rx={4} ry={10}
        fill="#f97316" fillOpacity={0.5} />
      <ellipse cx={0} cy={28} rx={3} ry={7}
        fill="#fbbf24" fillOpacity={0.8} />
      {/* Body */}
      <rect x={-12} y={-24} width={24} height={48} rx="12" fill="url(#rocket-body)" />
      {/* Nose */}
      <ellipse cx={0} cy={-24} rx={12} ry={8} fill="#a78bfa" />
      {/* Wings */}
      <polygon points="-12,10 -22,30 -12,24" fill="#6C5CE7" fillOpacity={0.8} />
      <polygon points="12,10 22,30 12,24" fill="#6C5CE7" fillOpacity={0.8} />
      {/* Window */}
      <circle cx={0} cy={-4} r={7} fill="#0B0B16" />
      <circle cx={0} cy={-4} r={5} fill="#3B82F6" fillOpacity={0.6} />
      <circle cx={-2} cy={-6} r={2} fill="white" fillOpacity={0.5} />
    </g>
  );
}

function AIOrbit({ tick }: { tick: number }) {
  const phase = (tick % 300) / 300;
  const angle = phase * Math.PI * 2;
  const cx = 240, cy = 200;
  const rx = 85, ry = 35;
  const ox = cx + Math.cos(angle) * rx;
  const oy = cy + Math.sin(angle) * ry;

  return (
    <g>
      {/* Orbit ellipse */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill="none" stroke="url(#orbit-ring)" strokeWidth="1.2"
        strokeDasharray="6 4" />
      {/* AI Brain orbiter */}
      <g transform={`translate(${ox}, ${oy})`} filter="url(#glow-soft)">
        <circle r={18} fill="#6C5CE7" fillOpacity={0.15} />
        <circle r={13} fill="#6C5CE7" fillOpacity={0.25} />
        <circle r={11} fill="#6C5CE7" fillOpacity={0.9} />
        <text x={0} y={5} textAnchor="middle" fontSize="12" style={{ userSelect: 'none' }}>🧠</text>
      </g>
    </g>
  );
}

function Sparkle({ x, y, tick, delay }: { x: number; y: number; tick: number; delay: number }) {
  const phase = ((tick + delay) % 80) / 80;
  const scale = 0.4 + Math.abs(Math.sin(phase * Math.PI * 2)) * 0.8;
  const opacity = 0.3 + Math.abs(Math.sin(phase * Math.PI * 2)) * 0.7;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} opacity={opacity}>
      <line x1="-6" y1="0" x2="6" y2="0" stroke="#a78bfa" strokeWidth="1.5" />
      <line x1="0" y1="-6" x2="0" y2="6" stroke="#a78bfa" strokeWidth="1.5" />
      <line x1="-4" y1="-4" x2="4" y2="4" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.6" />
      <line x1="4" y1="-4" x2="-4" y2="4" stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.6" />
    </g>
  );
}

function StatPill({ x, y, label, color, tick, delay }: {
  x: number; y: number; label: string; color: string; tick: number; delay: number;
}) {
  const phase = ((tick + delay) % 140) / 140;
  const float = Math.sin(phase * Math.PI * 2) * 7;
  const w = label.length * 7 + 24;

  return (
    <g transform={`translate(0, ${float})`}>
      <rect x={x} y={y} width={w} height={22} rx="11"
        fill={color} fillOpacity={0.12}
        stroke={color} strokeOpacity={0.4} strokeWidth="1" />
      <circle cx={x + 11} cy={y + 11} r={4} fill={color} fillOpacity={0.8} />
      <text x={x + 20} y={y + 15} fontSize="9" fill={color} fontWeight="700">
        {label}
      </text>
    </g>
  );
}
