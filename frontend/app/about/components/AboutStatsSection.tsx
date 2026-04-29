'use client';

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 60, damping: 15 });
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      motionValue.set(target);
    }
  }, [inView, target, motionValue]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = prefix + Math.round(v).toLocaleString() + suffix;
      }
    });
  }, [spring, prefix, suffix]);

  return <span ref={ref}>{prefix}0{suffix}</span>;
}

const stats = [
  { value: 1200, suffix: '+', label: '등록 학생', icon: '🎓', color: '#a855f7' },
  { value: 47, suffix: '개', label: '커리어 템플릿', icon: '🗺️', color: '#3b82f6' },
  { value: 98, suffix: '%', label: '만족도', icon: '⭐', color: '#f59e0b' },
  { value: 24, suffix: '/7', label: 'AI 멘토링', icon: '🤖', color: '#10b981' },
];

export function AboutStatsSection() {
  return (
    <section className="py-20 bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="web-container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="relative rounded-2xl p-6 text-center border border-white/8 bg-white/[0.03] overflow-hidden group cursor-default"
              initial={{ y: 40, scale: 0.85 }}
              whileInView={{ y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.05, borderColor: stat.color + '60' }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(circle at center, ${stat.color}15, transparent 70%)` }}
              />

              <motion.div
                className="text-3xl mb-2"
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 + 1 }}
              >
                {stat.icon}
              </motion.div>

              <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: stat.color }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-white/50 font-medium">{stat.label}</div>

              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-12 h-12 opacity-20 rounded-bl-3xl"
                style={{ background: `linear-gradient(135deg, ${stat.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
