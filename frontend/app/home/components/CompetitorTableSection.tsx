'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';

/* ── 5-step journey ── */
const STEPS = [
  { emoji: '🧭', label: '적성 찾기',   color: '#a78bfa' },
  { emoji: '🗺️', label: '직업 탐색',   color: '#60a5fa' },
  { emoji: '📐', label: '패스 설계',   color: '#34d399' },
  { emoji: '⚡',  label: '실행 계획',  color: '#fbbf24' },
  { emoji: '🏆', label: '포트폴리오', color: '#f472b6' },
] as const;

/* ── Competitor data ── */
const COMPETITORS = [
  {
    emoji: '📋',
    name: '검사형 서비스',
    example: '커리어넷, 워크넷 등',
    story: '"적성 결과 받았는데… 그 다음엔 뭘 해야 하죠?"',
    tag: '무료 공공 서비스',
    tagColor: '#9CA3AF',
    steps: [true, false, false, false, false] as boolean[],
  },
  {
    emoji: '🏫',
    name: '학교 납품형',
    example: '학교 계약 프로그램',
    story: '"학교에서만 써요. 집에서는 접속도 안 돼요."',
    tag: '학교 계약 전용',
    tagColor: '#F59E0B',
    steps: [true, true, false, false, false] as boolean[],
  },
  {
    emoji: '📱',
    name: '기록·SNS형',
    example: '꿈 기록 앱',
    story: '"꿈을 예쁘게 기록했는데… 어떻게 준비해야 할지 모르겠어요."',
    tag: 'B2C 앱',
    tagColor: '#EC4899',
    steps: [false, false, false, true, true] as boolean[],
  },
  {
    emoji: '💸',
    name: '오프라인 컨설팅',
    example: '대치동 입시 컨설팅',
    story: '"다 해줘요. 근데 강남에서만, 한 달에 100만원 이상이에요."',
    tag: '고비용 · 지역 한정',
    tagColor: '#EF4444',
    steps: [true, true, true, true, true] as boolean[],
    caveat: '💸 월 100만원+',
  },
] as const;

/* ─────────────────────────────────────────────
   SVG 1: Mini coverage strip (competitor cards)
───────────────────────────────────────────── */
function MiniCoverageSVG({
  steps,
  tagColor,
}: {
  steps: readonly boolean[];
  tagColor: string;
}) {
  const W = 280;
  const H = 52;
  const nodeX = [20, 80, 140, 200, 260];
  const cy = 20;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {nodeX.slice(0, -1).map((x, i) =>
          steps[i] && !steps[i + 1] ? (
            <linearGradient key={`fg${i}`} id={`fg${i}-${tagColor.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={tagColor} stopOpacity="0.65" />
              <stop offset="100%" stopColor={tagColor} stopOpacity="0.04" />
            </linearGradient>
          ) : null
        )}
      </defs>

      {/* Connecting lines */}
      {nodeX.slice(0, -1).map((x, i) => {
        const bothActive = steps[i] && steps[i + 1];
        const fadeOut   = steps[i] && !steps[i + 1];
        return (
          <line
            key={`line${i}`}
            x1={x + 12} y1={cy}
            x2={nodeX[i + 1] - 12} y2={cy}
            stroke={
              bothActive
                ? tagColor
                : fadeOut
                ? `url(#fg${i}-${tagColor.replace('#', '')})`
                : 'rgba(255,255,255,0.07)'
            }
            strokeWidth={2}
            strokeOpacity={bothActive ? 0.6 : 1}
            strokeDasharray={!bothActive && !fadeOut ? '3 4' : undefined}
          />
        );
      })}

      {/* Nodes */}
      {steps.map((active, i) => (
        <g key={i}>
          <circle
            cx={nodeX[i]} cy={cy} r={11}
            fill={active ? `${tagColor}22` : 'rgba(255,255,255,0.04)'}
            stroke={active ? tagColor : 'rgba(255,255,255,0.1)'}
            strokeWidth={1.5}
            strokeOpacity={active ? 0.7 : 0.25}
          />
          <text x={nodeX[i]} y={cy + 5} textAnchor="middle" fontSize={10}>
            {active ? STEPS[i].emoji : ''}
          </text>
          {!active && (
            <text x={nodeX[i]} y={cy + 5} textAnchor="middle" fontSize={9}
              fill="rgba(255,255,255,0.15)" fontWeight="bold">
              ✕
            </text>
          )}
          {/* Label */}
          <text x={nodeX[i]} y={H - 4} textAnchor="middle" fontSize={7.5}
            fill={active ? tagColor : 'rgba(255,255,255,0.18)'} fontWeight="600">
            {STEPS[i].label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SVG 2: Full animated journey (AI CareerPath)
───────────────────────────────────────────── */
function FullJourneySVG() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return <div className="w-full h-28" />;

  const W = 560;
  const H = 110;
  const nodeX = [44, 160, 280, 400, 516];
  const cy = 50;

  const particleCount = 8;
  const particles = Array.from({ length: particleCount }, (_, i) => {
    const progress = ((tick + i * 13) % 100) / 100;
    const segIdx = Math.floor(progress * 4);
    const segProgress = (progress * 4) % 1;
    const safeIdx = Math.min(segIdx, 3);
    const x1 = nodeX[safeIdx] + 14;
    const x2 = nodeX[safeIdx + 1] - 14;
    const px = x1 + (x2 - x1) * segProgress;
    const opacity =
      segProgress < 0.12
        ? segProgress / 0.12
        : segProgress > 0.88
        ? (1 - segProgress) / 0.12
        : 1;
    const color = STEPS[safeIdx].color;
    return { x: px, y: cy, opacity, color };
  });

  const pulse = 0.5 + 0.5 * Math.sin((tick * Math.PI * 2) / 60);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="fj-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {STEPS.slice(0, -1).map((step, i) => (
          <linearGradient key={`lg${i}`} id={`lg${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={step.color} stopOpacity="0.55" />
            <stop offset="100%" stopColor={STEPS[i + 1].color} stopOpacity="0.55" />
          </linearGradient>
        ))}
      </defs>

      {/* Connecting lines */}
      {nodeX.slice(0, -1).map((x, i) => (
        <line
          key={`l${i}`}
          x1={x + 22} y1={cy}
          x2={nodeX[i + 1] - 22} y2={cy}
          stroke={`url(#lg${i})`}
          strokeWidth={2.5}
        />
      ))}

      {/* Animated particles */}
      {particles.map((p, i) => (
        <circle
          key={`p${i}`}
          cx={p.x} cy={p.y} r={3.5}
          fill={p.color}
          fillOpacity={p.opacity}
          filter="url(#fj-glow)"
        />
      ))}

      {/* Nodes */}
      {STEPS.map((step, i) => (
        <g key={step.label}>
          {/* Pulse ring */}
          <circle
            cx={nodeX[i]} cy={cy}
            r={22 + pulse * 4}
            fill={step.color}
            fillOpacity={0.06}
          />
          {/* Outer ring */}
          <circle
            cx={nodeX[i]} cy={cy} r={20}
            fill={`${step.color}18`}
            stroke={step.color}
            strokeOpacity={0.55}
            strokeWidth={1.8}
          />
          {/* Inner fill */}
          <circle cx={nodeX[i]} cy={cy} r={15} fill={`${step.color}30`} />
          {/* Emoji */}
          <text x={nodeX[i]} y={cy + 6} textAnchor="middle" fontSize={15} filter="url(#fj-glow)">
            {step.emoji}
          </text>
          {/* Label */}
          <text
            x={nodeX[i]} y={cy + 38} textAnchor="middle"
            fontSize={9.5} fill={step.color} fillOpacity={0.85} fontWeight="700"
          >
            {step.label}
          </text>
        </g>
      ))}

      {/* "완료" stars at each node */}
      {STEPS.map((step, i) => (
        <text
          key={`star${i}`}
          x={nodeX[i] + 14} y={cy - 14}
          textAnchor="middle" fontSize={9}
          opacity={0.6 + 0.4 * Math.sin((tick / 40 + i * 0.7) * Math.PI)}
        >
          ✓
        </text>
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   SVG 3: Journey overview header illustration
───────────────────────────────────────────── */
function JourneyHeaderSVG() {
  return (
    <svg viewBox="0 0 560 72" className="w-full max-w-2xl mx-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="jh-glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dotted path */}
      {[0, 1, 2, 3].map((i) => {
        const x1 = 44 + i * 118 + 22;
        const x2 = 44 + (i + 1) * 118 - 22;
        return (
          <line key={i}
            x1={x1} y1={28} x2={x2} y2={28}
            stroke="rgba(167,139,250,0.3)" strokeWidth={1.5}
            strokeDasharray="4 4"
          />
        );
      })}

      {/* Step nodes */}
      {STEPS.map((step, i) => {
        const x = 44 + i * 118;
        return (
          <g key={step.label}>
            <circle cx={x} cy={28} r={20}
              fill={`${step.color}15`}
              stroke={step.color} strokeOpacity={0.4} strokeWidth={1.5}
            />
            <text x={x} y={34} textAnchor="middle" fontSize={16} filter="url(#jh-glow)">
              {step.emoji}
            </text>
            <text x={x} y={60} textAnchor="middle" fontSize={9}
              fill={step.color} fillOpacity={0.75} fontWeight="600">
              {step.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Competitor Card
───────────────────────────────────────────── */
function CompetitorCard({
  competitor,
  index,
}: {
  competitor: (typeof COMPETITORS)[number];
  index: number;
}) {
  const coveredCount = competitor.steps.filter(Boolean).length;
  const hasCaveat = 'caveat' in competitor && competitor.caveat;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="relative rounded-2xl p-5 border overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.025)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{competitor.emoji}</span>
          <div>
            <p className="text-sm font-bold text-white/80 leading-tight">{competitor.name}</p>
            <p className="text-[11px] text-white/30">{competitor.example}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
          style={{
            background: `${competitor.tagColor}18`,
            color: competitor.tagColor,
            border: `1px solid ${competitor.tagColor}30`,
          }}
        >
          {competitor.tag}
        </span>
      </div>

      {/* Story quote */}
      <p className="text-xs text-white/45 italic mb-4 leading-relaxed pl-2 border-l-2 border-white/10">
        {competitor.story}
      </p>

      {/* Mini coverage SVG */}
      <MiniCoverageSVG steps={competitor.steps} tagColor={competitor.tagColor} />

      {/* Summary row */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-white/28">
          {coveredCount}단계만 해결 / 5단계 중
        </span>
        {hasCaveat && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
          >
            {(competitor as { caveat: string }).caveat}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Section
───────────────────────────────────────────── */
export function CompetitorTableSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={50} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-slate-950/20 to-black/0 pointer-events-none" />

      <div className="web-container relative z-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span
            className="inline-block text-xs font-extrabold px-4 py-1.5 rounded-full mb-5 uppercase tracking-[0.2em]"
            style={{
              background: 'rgba(108,92,231,0.12)',
              color: '#a78bfa',
              border: '1px solid rgba(108,92,231,0.25)',
            }}
          >
            왜 AI CareerPath인가요?
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            다른 앱은{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #f87171, #fb923c)' }}
            >
              딱 하나만
            </span>{' '}
            해결해줘요
          </h2>
          <p className="text-white/45 text-base max-w-xl mx-auto leading-relaxed mb-10">
            진로 준비는 이 5단계가 모두 필요합니다.
            <br />
            <span className="text-white/65 font-semibold">하나만 해결해주는 서비스로는 절반도 못 갑니다.</span>
          </p>

          {/* Journey overview SVG */}
          <JourneyHeaderSVG />
        </motion.div>

        {/* ── Competitor cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {COMPETITORS.map((c, i) => (
            <CompetitorCard key={c.name} competitor={c} index={i} />
          ))}
        </div>

        {/* ── VS divider ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 my-8"
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-purple-500/30" />
          <span
            className="text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(96,165,250,0.15))',
              color: '#a78bfa',
              border: '1px solid rgba(108,92,231,0.3)',
            }}
          >
            VS
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/10 to-purple-500/30" />
        </motion.div>

        {/* ── AI CareerPath hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="relative rounded-3xl p-7 md:p-10 border overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(108,92,231,0.18) 0%, rgba(96,165,250,0.1) 100%)',
            borderColor: 'rgba(108,92,231,0.4)',
            boxShadow: '0 0 60px rgba(108,92,231,0.15)',
          }}
        >
          {/* Glow blobs */}
          <div
            className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #6C5CE7, transparent)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-10 -left-10 w-40 h-40 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}
          />

          {/* Title row */}
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🚀</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xl font-black text-white">AI CareerPath</p>
                  <span
                    className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #6C5CE7, #60a5fa)',
                      color: 'white',
                    }}
                  >
                    무료
                  </span>
                </div>
                <p className="text-sm text-purple-300/70">AI 협업 · 기본 무료 · 전국 어디서나</p>
              </div>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white self-start sm:self-auto"
              style={{ background: 'rgba(108,92,231,0.25)', border: '1px solid rgba(167,139,250,0.3)' }}
            >
              ✨ 5단계 모두 해결
            </div>
          </div>

          {/* Animated full journey SVG */}
          <div className="relative mb-6">
            <FullJourneySVG />
          </div>

          {/* Proof points */}
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { emoji: '🆓', title: '기본 무료',      desc: '회원가입 즉시 모든 기본 기능 사용 가능' },
              { emoji: '🌏', title: '전국 어디서나', desc: '강남이 아니어도 괜찮아요. 365일 24시간' },
              { emoji: '🤖', title: 'AI가 함께',      desc: '혼자 막힐 때 AI 멘토가 바로 도와줘요' },
            ].map((p) => (
              <div
                key={p.title}
                className="flex items-start gap-3 rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(167,139,250,0.15)',
                }}
              >
                <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{p.title}</p>
                  <p className="text-xs text-white/45 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Bottom note ── */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-xs text-white/22 mt-5"
        >
          * 오프라인 컨설팅도 5단계를 제공하지만, 월 100만원 이상 · 강남 지역 한정입니다.
        </motion.p>
      </div>
    </section>
  );
}
