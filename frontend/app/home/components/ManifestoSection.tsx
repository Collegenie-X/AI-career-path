'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const manifesto = homeContent.manifesto as typeof homeContent.manifesto;

/* ── Stick figure helper ─────────────────────────────────────── */
function StickFigure({
  x,
  y,
  color,
  yOffset = 0,
  scale = 1,
}: {
  x: number;
  y: number;
  color: string;
  yOffset?: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y + yOffset}) scale(${scale})`}>
      <circle cx={0} cy={-18} r={7} fill={color} fillOpacity={0.92} />
      <line x1={0} y1={-11} x2={0} y2={8} stroke={color} strokeWidth={2.2} strokeOpacity={0.9} />
      <line x1={-9} y1={-3} x2={9} y2={-3} stroke={color} strokeWidth={2.2} strokeOpacity={0.9} />
      <line x1={0} y1={8} x2={-7} y2={22} stroke={color} strokeWidth={2.2} strokeOpacity={0.9} />
      <line x1={0} y1={8} x2={7} y2={22} stroke={color} strokeWidth={2.2} strokeOpacity={0.9} />
    </g>
  );
}

/* ── Before / After SVG ─────────────────────────────────────── */
function PrivilegeBreakSVG() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <div className="w-full max-w-lg mx-auto h-80" />;

  const aiX = 390;
  const aiY = 88;

  const targets = [
    { x: 290, y: 318 },
    { x: 340, y: 328 },
    { x: 388, y: 322 },
    { x: 436, y: 328 },
    { x: 480, y: 318 },
  ];

  const personColors = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6'];

  const particleCount = 12;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const progress = ((tick + i * 8) % 100) / 100;
    const target = targets[i % targets.length];
    const cpX = (aiX + target.x) / 2 - 15;
    const cpY = 205;
    const px =
      (1 - progress) ** 2 * aiX +
      2 * (1 - progress) * progress * cpX +
      progress ** 2 * target.x;
    const py =
      (1 - progress) ** 2 * aiY +
      2 * (1 - progress) * progress * cpY +
      progress ** 2 * target.y;
    const opacity =
      progress < 0.1 ? progress * 10 : progress > 0.88 ? (1 - progress) / 0.12 : 1;
    return { x: px, y: py, opacity };
  });

  const crackPulse = 0.5 + 0.5 * Math.sin((tick * Math.PI * 2) / 60);
  const t = tick / 60;

  return (
    <svg
      viewBox="0 0 540 390"
      className="w-full max-w-lg mx-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pb-crack-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.35 + crackPulse * 0.3} />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pb-ai-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pb-left-vignette" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
        </radialGradient>
        <filter id="pb-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pb-soft">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background zones */}
      <rect x={0} y={0} width={250} height={390} fill="url(#pb-left-vignette)" />
      <rect
        x={280}
        y={0}
        width={260}
        height={390}
        fill="rgba(108,92,231,0.05)"
      />

      {/* Zone labels */}
      <text
        x={120}
        y={22}
        textAnchor="middle"
        fontSize={9.5}
        fill="#f87171"
        fillOpacity={0.7}
        fontWeight="700"
        letterSpacing="2.5"
      >
        BEFORE
      </text>
      <text
        x={400}
        y={22}
        textAnchor="middle"
        fontSize={9.5}
        fill="#a78bfa"
        fillOpacity={0.7}
        fontWeight="700"
        letterSpacing="2.5"
      >
        WITH AI CAREERPATH
      </text>

      {/* ── LEFT: Ivory Tower ── */}
      {/* Tower body */}
      <rect
        x={65}
        y={58}
        width={115}
        height={165}
        rx={4}
        fill="rgba(239,68,68,0.07)"
        stroke="rgba(239,68,68,0.32)"
        strokeWidth={1.5}
      />
      {/* Battlements */}
      {[65, 91, 117, 143].map((bx, i) => (
        <rect
          key={`b${i}`}
          x={bx}
          y={50}
          width={18}
          height={13}
          rx={2}
          fill="rgba(239,68,68,0.12)"
          stroke="rgba(239,68,68,0.36)"
          strokeWidth={1}
        />
      ))}
      {/* Windows */}
      {[
        [90, 88],
        [145, 88],
        [90, 130],
        [145, 130],
      ].map(([wx, wy], i) => (
        <rect
          key={`w${i}`}
          x={wx}
          y={wy}
          width={22}
          height={26}
          rx={2}
          fill="rgba(0,0,0,0.35)"
          stroke="rgba(239,68,68,0.22)"
          strokeWidth={1}
        />
      ))}
      {/* Door arch */}
      <path
        d="M 103 223 L 103 185 Q 122 168 141 185 L 141 223 Z"
        fill="rgba(0,0,0,0.55)"
        stroke="rgba(239,68,68,0.38)"
        strokeWidth={1.5}
      />
      {/* Lock */}
      <rect x={115} y={196} width={14} height={13} rx={2} fill="#ef4444" fillOpacity={0.65} />
      <path
        d="M 116 196 Q 122 187 128 196"
        fill="none"
        stroke="#ef4444"
        strokeOpacity={0.75}
        strokeWidth={2}
      />

      {/* Elite suits at top */}
      <StickFigure
        x={92}
        y={76}
        color="#ef4444"
        scale={0.7}
        yOffset={Math.sin(t * Math.PI * 2) * 2}
      />
      <StickFigure
        x={148}
        y={76}
        color="#ef4444"
        scale={0.7}
        yOffset={Math.sin((t + 0.5) * Math.PI * 2) * 2}
      />

      {/* Money bags */}
      {[
        [32, 88],
        [20, 158],
        [48, 208],
      ].map(([mx, my], i) => (
        <g
          key={`m${i}`}
          transform={`translate(${mx}, ${my + Math.sin((t + i * 0.65) * Math.PI * 2) * 4})`}
        >
          <circle
            cx={0}
            cy={0}
            r={13}
            fill="rgba(251,191,36,0.12)"
            stroke="rgba(251,191,36,0.35)"
            strokeWidth={1}
          />
          <text x={0} y={5} textAnchor="middle" fontSize={11} fillOpacity={0.8}>
            💰
          </text>
        </g>
      ))}

      {/* Excluded figures — outside the tower, arms down */}
      <StickFigure
        x={28}
        y={288}
        color="rgba(156,163,175,0.5)"
        scale={0.85}
        yOffset={Math.sin((t + 1.1) * Math.PI * 2) * 1.5}
      />
      <StickFigure
        x={62}
        y={278}
        color="rgba(156,163,175,0.5)"
        scale={0.85}
        yOffset={Math.sin((t + 1.5) * Math.PI * 2) * 1.5}
      />
      {/* Red X over excluded figures */}
      <line
        x1={16}
        y1={255}
        x2={44}
        y2={278}
        stroke="#ef4444"
        strokeWidth={1.5}
        strokeOpacity={0.45}
      />
      <line
        x1={44}
        y1={255}
        x2={16}
        y2={278}
        stroke="#ef4444"
        strokeWidth={1.5}
        strokeOpacity={0.45}
      />

      {/* Left label */}
      <text
        x={122}
        y={368}
        textAnchor="middle"
        fontSize={9}
        fill="#f87171"
        fillOpacity={0.5}
        fontWeight="600"
      >
        비용 · 인맥 · 지역 장벽
      </text>

      {/* ── CENTER: Crumbling Wall / Crack ── */}
      <rect x={232} y={0} width={18} height={390} fill="rgba(255,255,255,0.055)" />
      {/* Glow behind crack */}
      <ellipse cx={241} cy={195} rx={32} ry={90} fill="url(#pb-crack-glow)" />
      {/* Crack */}
      <polyline
        points="241,85 236,115 247,148 238,178 244,210 236,242 246,272 241,298"
        fill="none"
        stroke="#fbbf24"
        strokeOpacity={0.55 + crackPulse * 0.45}
        strokeWidth={2.8}
        filter="url(#pb-glow)"
      />
      {/* Arrow through crack */}
      <path
        d="M 250 190 L 268 200 L 250 210 Z"
        fill="#fbbf24"
        fillOpacity={0.85}
        filter="url(#pb-glow)"
      />

      {/* ── RIGHT: Open access — AI + People ── */}
      {/* AI node glow halo */}
      <circle
        cx={aiX}
        cy={aiY}
        r={42}
        fill="url(#pb-ai-glow)"
        opacity={0.25}
      />
      {/* Pulse ring */}
      <circle
        cx={aiX}
        cy={aiY}
        r={30 + crackPulse * 5}
        fill="none"
        stroke="#a78bfa"
        strokeOpacity={0.35}
        strokeWidth={1.5}
        filter="url(#pb-soft)"
      />
      {/* AI core */}
      <circle
        cx={aiX}
        cy={aiY}
        r={24}
        fill="#6C5CE7"
        fillOpacity={0.88}
        filter="url(#pb-soft)"
      />
      <text x={aiX} y={aiY + 6} textAnchor="middle" fontSize={17}>
        🤖
      </text>
      <text
        x={aiX}
        y={aiY + 50}
        textAnchor="middle"
        fontSize={8.5}
        fill="#a78bfa"
        fillOpacity={0.75}
        fontWeight="700"
      >
        AI CareerPath
      </text>

      {/* Dashed stream lines */}
      {targets.map((tgt, i) => (
        <path
          key={`dash${i}`}
          d={`M ${aiX} ${aiY} Q ${(aiX + tgt.x) / 2 - 15} 205 ${tgt.x} ${tgt.y}`}
          fill="none"
          stroke={personColors[i]}
          strokeOpacity={0.12}
          strokeWidth={1}
          strokeDasharray="4 5"
        />
      ))}

      {/* Animated data particles */}
      {particles.map((p, i) => (
        <circle
          key={`pt${i}`}
          cx={p.x}
          cy={p.y}
          r={3.5}
          fill={personColors[i % personColors.length]}
          fillOpacity={p.opacity}
          filter="url(#pb-soft)"
        />
      ))}

      {/* People receiving info */}
      {targets.map((tgt, i) => (
        <g key={`person${i}`}>
          <StickFigure
            x={tgt.x}
            y={tgt.y + 12}
            color={personColors[i]}
            scale={0.92}
            yOffset={Math.sin((t + i * 0.42) * Math.PI * 2) * 2.5}
          />
          {/* Small info star above head */}
          <circle
            cx={tgt.x}
            cy={
              tgt.y -
              10 +
              Math.sin((t + i * 0.42) * Math.PI * 2) * 2.5
            }
            r={4.5 + 1.2 * Math.sin((t * 2 + i) * Math.PI)}
            fill={personColors[i]}
            fillOpacity={0.22 + 0.1 * Math.sin((t * 1.5 + i) * Math.PI)}
          />
        </g>
      ))}

      {/* Right label */}
      <text
        x={390}
        y={368}
        textAnchor="middle"
        fontSize={9}
        fill="#a78bfa"
        fillOpacity={0.55}
        fontWeight="600"
      >
        누구나 · 어디서나 · 동등하게
      </text>
    </svg>
  );
}

/* ── Manifesto Section ──────────────────────────────────────── */
export function ManifestoSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={80} />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/12 to-black pointer-events-none" />

      <div className="web-container relative z-10">

        {/* ── Hero Declaration ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block text-xs font-extrabold px-5 py-1.5 rounded-full mb-8 uppercase tracking-[0.22em]"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.22)',
            }}
          >
            ✊ 우리의 선언
          </motion.span>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="mb-6"
          >
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.08] tracking-tight mb-1">
              진로 정보는
            </h2>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.08] tracking-tight">
              <span
                style={{
                  color: '#ef4444',
                  textDecoration: 'line-through',
                  textDecorationColor: '#ef4444',
                  textDecorationThickness: '5px',
                  opacity: 0.82,
                }}
              >
                특권
              </span>
              <span className="text-white">이 아닙니다</span>
            </h2>
          </motion.div>

          {/* Transform line */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-8"
          >
            <span className="text-sm text-red-400/55 line-through decoration-red-400/40">
              돈 많은 사람들의 독점
            </span>
            <span className="text-purple-400 text-xl font-light">→</span>
            <span
              className="text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #c4b5fd 0%, #818cf8 50%, #60a5fa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              우리 모두가 함께 만들어 나갑니다
            </span>
          </motion.div>

          {/* Supporting copy */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="text-white/45 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            비싼 컨설팅도, 좋은 네트워크도 필요 없습니다.{' '}
            <span className="text-white/72 font-semibold">
              당신이 얼마나 노력하느냐가 유일한 차이입니다.
            </span>
          </motion.p>
        </motion.div>

        {/* ── Two-column: SVG + Cards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">

          {/* Left: Before/After SVG */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center"
          >
            <PrivilegeBreakSVG />
            <p className="text-center text-sm text-white/32 mt-4 max-w-xs leading-relaxed">
              소수가 독점하던 커리어 정보가 AI를 통해 누구에게나 연결됩니다.
              정보의 흐름이 달라지면 출발선이 달라집니다.
            </p>
          </motion.div>

          {/* Right: Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {manifesto.cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                style={{ background: card.colorBg, borderColor: card.colorBorder }}
              >
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `0 0 50px ${card.color}20` }}
                />

                <div className="flex items-start justify-between mb-3">
                  <div
                    className="text-3xl"
                    style={{
                      animation: `icon-float ${3.5 + i * 0.4}s ease-in-out ${i * 0.5}s infinite`,
                    }}
                  >
                    {card.emoji}
                  </div>
                  <div className="flex gap-1">
                    {card.icons.map((icon, j) => (
                      <span
                        key={j}
                        className="text-lg opacity-50 group-hover:opacity-100 transition-opacity"
                      >
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>

                <span
                  className="inline-block text-xs font-extrabold px-3 py-1 rounded-full mb-2 uppercase tracking-wider"
                  style={{ background: `${card.color}20`, color: card.color }}
                >
                  {card.short}
                </span>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {card.title}
                </h3>

                {(card as { description?: string }).description && (
                  <p className="text-xs text-white/55 leading-relaxed mb-3">
                    {(card as { description: string }).description}
                  </p>
                )}

                <blockquote
                  className="text-xs italic text-white/50 pl-3 border-l-2 leading-relaxed"
                  style={{ borderColor: card.color }}
                >
                  {card.quote}
                </blockquote>

                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Closing manifesto stamp ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl p-8 md:p-10 border text-center"
          style={{
            background:
              'linear-gradient(135deg, rgba(108,92,231,0.1) 0%, rgba(59,130,246,0.06) 100%)',
            borderColor: 'rgba(108,92,231,0.22)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400/70 mb-4">
            {manifesto.header.badge}
          </p>
          <p className="text-xl md:text-2xl font-extrabold text-white mb-3 leading-snug">
            {manifesto.header.title}{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #a29bfe, #6C5CE7, #74b9ff)',
              }}
            >
              {manifesto.header.titleHighlight}
            </span>
          </p>
          <p className="text-white/48 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {manifesto.header.intro}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
