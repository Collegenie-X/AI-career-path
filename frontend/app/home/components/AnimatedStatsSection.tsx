'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const STATS = [
  {
    value: 200,
    suffix: '+',
    label: '커리어 패스',
    desc: '200개 이상의 직업 우주에서 AI가 당신의 궤적을 찾습니다',
    color: '#6C5CE7',
    emoji: '🗺️',
  },
  {
    value: 5,
    suffix: '단계',
    label: '여정',
    desc: '적성 → 탐색 → 설계 → 실행 → 포트폴리오, 5단계로 완성하는 커리어',
    color: '#3B82F6',
    emoji: '🚀',
  },
  {
    value: 100,
    suffix: '%',
    label: '무료 기본 기능',
    desc: '회원가입 즉시 모든 기본 기능을 무료로 이용할 수 있습니다',
    color: '#22C55E',
    emoji: '🆓',
  },
  {
    value: 0,
    suffix: '원',
    label: '최소 시작 비용',
    desc: 'AI 협업은 쓴 만큼만 결제. 부담 없이 시작하세요',
    color: '#FBBF24',
    emoji: '💳',
  },
];

function useCountUp(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const startTime = performance.now();
    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCountUp(stat.value, 1600, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative rounded-3xl p-7 border transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-default"
      style={{
        background: `${stat.color}15`,
        borderColor: `${stat.color}45`,
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 50px ${stat.color}20` }}
      />

      {/* SVG mini decoration */}
      <svg
        viewBox="0 0 120 60"
        className="absolute top-3 right-3 w-20 opacity-20 group-hover:opacity-40 transition-opacity"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          points="0,55 20,40 40,45 60,20 80,28 100,10 120,15"
          fill="none"
          stroke={stat.color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="100" cy="10" r="4" fill={stat.color} />
      </svg>

      {/* Emoji */}
      <div
        className="text-4xl mb-4"
        style={{ animation: `icon-float ${3 + index * 0.4}s ease-in-out ${index * 0.3}s infinite` }}
      >
        {stat.emoji}
      </div>

      {/* Count up value */}
      <div className="flex items-end gap-1 mb-1">
        <span
          className="text-4xl md:text-5xl font-extrabold leading-none"
          style={{ color: stat.color }}
        >
          {count}
        </span>
        <span className="text-xl font-bold text-white/60 pb-1">{stat.suffix}</span>
      </div>

      <p className="text-sm font-bold text-white mb-2">{stat.label}</p>
      <p className="text-xs text-white/45 leading-relaxed">{stat.desc}</p>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
      />
    </motion.div>
  );
}

function BackgroundWaveSVG() {
  return (
    <svg
      viewBox="0 0 1200 120"
      className="absolute top-0 left-0 w-full opacity-[0.04]"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,0 L0,0 Z"
        fill="#6C5CE7"
      />
    </svg>
  );
}

export function AnimatedStatsSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <BackgroundWaveSVG />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6C5CE7 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="web-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            📊 AI 시대의 진로 설계
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            실행은 AI가, <span className="text-purple-300">기획·계획·디버깅</span>은 당신이
          </h2>
          <p className="text-white/45 text-base max-w-xl mx-auto leading-relaxed">
            AI 시대에는 누구나 빠르게 만들 수 있습니다. 차이는 <b className="text-white/80">진짜 문제를 찾고 정의하는 힘</b>,
            그리고 <b className="text-white/80">계획을 끊임없이 디버깅하는 사고력</b>에서 갈립니다.
            AI CareerPath는 그 과정 자체에 최적화된 플랫폼입니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
