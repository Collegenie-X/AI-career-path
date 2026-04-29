'use client';

import { motion } from 'framer-motion';

const funFacts = [
  { emoji: '☕', text: '무수한 커피와 함께 밤새 코딩', color: '#f59e0b' },
  { emoji: '🤝', text: 'AI와 페어 프로그래밍으로 개발', color: '#a855f7' },
  { emoji: '💡', text: '학생 멘토링에서 아이디어 발굴', color: '#3b82f6' },
  { emoji: '🔄', text: '빠른 피드백 → 즉각 개선 사이클', color: '#10b981' },
  { emoji: '🎯', text: '진짜 문제 해결에만 집중', color: '#ec4899' },
  { emoji: '🌱', text: '매일 성장하는 플랫폼', color: '#f97316' },
];

export function AboutFunFactsSection() {
  return (
    <section className="py-16 bg-white/[0.015] overflow-hidden">
      <div className="web-container">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-2">Fun Facts</p>
          <h2 className="text-2xl md:text-3xl font-black text-white">만드는 과정의 비하인드 ✨</h2>
        </motion.div>

        {/* Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex gap-4 animate-[marquee_20s_linear_infinite]">
            {[...funFacts, ...funFacts].map((fact, i) => (
              <motion.div
                key={i}
                className="flex-none flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 bg-white/[0.04] whitespace-nowrap"
                whileHover={{ scale: 1.05, borderColor: fact.color + '50' }}
              >
                <span className="text-xl">{fact.emoji}</span>
                <span className="text-sm text-white/70 font-medium">{fact.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
