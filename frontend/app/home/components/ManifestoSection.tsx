'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const manifesto = homeContent.manifesto as typeof homeContent.manifesto;

function InfoDemocracySVG() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 55);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <div className="w-full max-w-xs mx-auto h-96" />;

  const nodes = [
    { x: 200, y: 80, label: '컨설팅 업체', color: '#ef4444', locked: true },
    { x: 80, y: 200, label: '대학 진학', color: '#6C5CE7', locked: false },
    { x: 320, y: 200, label: '선배 경험', color: '#3B82F6', locked: false },
    { x: 140, y: 320, label: '취업 정보', color: '#FBBF24', locked: false },
    { x: 260, y: 320, label: 'AI 패스', color: '#22C55E', locked: false },
  ];

  const edges = [
    [0, 1], [0, 2], [1, 3], [2, 4], [1, 4], [2, 3],
  ];

  return (
    <svg viewBox="0 0 400 420" className="w-full max-w-xs mx-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ms-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="ms-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6C5CE7" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#6C5CE7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background glow */}
      <ellipse cx="200" cy="210" rx="180" ry="150" fill="url(#ms-bg)" />

      {/* Edges */}
      {edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b];
        const progress = ((tick + i * 25) % 100) / 100;
        const px = na.x + (nb.x - na.x) * progress;
        const py = na.y + (nb.y - na.y) * progress;
        return (
          <g key={`e${i}`}>
            <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={na.color} strokeOpacity={0.2} strokeWidth={1.5} />
            <circle cx={px} cy={py} r={3} fill={na.color} fillOpacity={0.8}
              filter="url(#ms-glow)" />
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const phase = ((tick + i * 20) % 120) / 120;
        const float = Math.sin(phase * Math.PI * 2) * 5;
        return (
          <g key={n.label} transform={`translate(0, ${float})`} filter="url(#ms-glow)">
            {/* Pulse ring */}
            <circle cx={n.x} cy={n.y}
              r={28 + Math.sin(phase * Math.PI * 2) * 4}
              fill={n.color} fillOpacity={0.07} />
            {/* Node circle */}
            <circle cx={n.x} cy={n.y} r={24}
              fill={n.color} fillOpacity={0.15}
              stroke={n.color} strokeOpacity={0.4} strokeWidth={1.5} />
            <circle cx={n.x} cy={n.y} r={20} fill={n.color} fillOpacity={0.85} />
            {/* Lock icon for locked node */}
            {n.locked ? (
              <>
                <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="14">🔒</text>
                {/* Red X overlay */}
                <line x1={n.x - 10} y1={n.y - 10} x2={n.x + 10} y2={n.y + 10}
                  stroke="#ef4444" strokeWidth={2.5} strokeOpacity={0.9} />
                <line x1={n.x + 10} y1={n.y - 10} x2={n.x - 10} y2={n.y + 10}
                  stroke="#ef4444" strokeWidth={2.5} strokeOpacity={0.9} />
              </>
            ) : (
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="14">✓</text>
            )}
            {/* Label */}
            <text x={n.x} y={n.y + 42} textAnchor="middle" fontSize="10"
              fill="white" fillOpacity={0.7} fontWeight="600">
              {n.label}
            </text>
          </g>
        );
      })}

      {/* Center AI label */}
      <g>
        <text x="200" y="398" textAnchor="middle" fontSize="11"
          fill="#a78bfa" fontWeight="700" opacity={0.8}>
          AI CareerPath — 모두에게 열린 정보
        </text>
      </g>
    </svg>
  );
}

export function ManifestoSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={80} />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/12 to-black pointer-events-none" />

      <div className="web-container relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {manifesto.header.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            {manifesto.header.title}
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #a29bfe, #6C5CE7, #74b9ff)' }}
            >
              {manifesto.header.titleHighlight}
            </span>
          </h2>
          {(manifesto.header as { intro?: string }).intro && (
            <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
              {(manifesto.header as { intro: string }).intro}
            </p>
          )}
        </motion.div>

        {/* Two-column: SVG + Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: SVG visualization */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center"
          >
            <InfoDemocracySVG />
            <p className="text-center text-sm text-white/35 mt-4 max-w-xs leading-relaxed">
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
                    style={{ animation: `icon-float ${3.5 + i * 0.4}s ease-in-out ${i * 0.5}s infinite` }}
                  >
                    {card.emoji}
                  </div>
                  <div className="flex gap-1">
                    {card.icons.map((icon, j) => (
                      <span key={j} className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">
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

                <h3 className="text-base font-bold text-white mb-2 leading-snug">{card.title}</h3>

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
                  style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom narrative banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-3xl p-8 md:p-10 border text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.08) 0%, rgba(59,130,246,0.05) 100%)',
            borderColor: 'rgba(108,92,231,0.2)',
          }}
        >
          <p className="text-2xl font-extrabold text-white mb-3">
            "진로 정보는 특권이 아닙니다"
          </p>
          <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
            AI CareerPath는 비싼 컨설팅 없이도, 좋은 네트워크 없이도 —
            <span className="text-purple-400 font-semibold"> 누구나 자신만의 커리어를 설계</span>할 수 있도록
            AI 기술과 집단지성을 결합했습니다. 당신이 얼마나 노력하느냐가
            <span className="text-blue-400 font-semibold"> 유일한 차이</span>입니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
