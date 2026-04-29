'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Target, Users, Zap, Search } from 'lucide-react';
import { useState } from 'react';
import aboutContent from '@/data/about-content.json';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  users: Users,
  zap: Zap,
  search: Search,
};

const capabilityColors = ['#a855f7', '#3b82f6', '#f59e0b', '#10b981'];

function FlipCard({ capability, index }: { capability: { id: string; icon: string; title: string; description: string }; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = iconMap[capability.icon] || Target;
  const color = capabilityColors[index % capabilityColors.length];

  return (
    <motion.div
      className="relative h-44 cursor-pointer"
      initial={{ y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => setFlipped(!flipped)}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 80 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col items-start justify-between border border-white/8 bg-white/[0.03] hover:border-purple-500/30 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">{capability.title}</h4>
            <p className="text-xs text-white/40">클릭해서 자세히 보기 →</p>
          </div>
          {/* Glow dot */}
          <div
            className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse"
            style={{ background: color }}
          />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-center border"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
            borderColor: `${color}40`,
          }}
        >
          <p className="text-sm text-white/75 leading-relaxed">{capability.description}</p>
          <p className="text-xs mt-3" style={{ color }}>클릭해서 돌아가기</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AboutPhilosophySectionNew() {
  const { philosophy } = aboutContent;
  const humanSuperiorityPrinciple = philosophy.principles.find(p => p.id === 'human-superiority');

  return (
    <section className="py-24 md:py-32 bg-white/[0.015] relative overflow-hidden">
      <div className="web-container">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {philosophy.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{philosophy.title}</h2>
          <p className="text-base text-white/50 max-w-2xl mx-auto">{philosophy.subtitle}</p>
        </motion.div>

        {/* AI vs Human big split */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI side */}
            <motion.div
              className="rounded-3xl p-8 border border-blue-500/30 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))' }}
              initial={{ x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🤖
              </motion.div>
              <h3 className="text-xl font-bold text-blue-300 mb-3">AI가 하는 것</h3>
              <ul className="space-y-2.5">
                {['코드 작성', '디자인 구현', '콘텐츠 생성', '데이터 분석', '반복 작업 자동화'].map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-white/65"
                    initial={{ x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <span className="text-blue-400 text-base">✓</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              {/* Background decoration */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />
            </motion.div>

            {/* Human side */}
            <motion.div
              className="rounded-3xl p-8 border border-purple-500/40 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04))' }}
              initial={{ x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🧠
              </motion.div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">사람이 해야 하는 것</h3>
              <ul className="space-y-2.5">
                {['진짜 문제 정의', '기획과 전략', '공감과 직관', '실행 의지', '자기 성찰'].map((item, i) => (
                  <motion.li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-white/65"
                    initial={{ x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <span className="text-purple-400 text-base">★</span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              {/* Background decoration */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl" />
            </motion.div>
          </div>
        </div>

        {/* Flip cards - human capabilities */}
        {humanSuperiorityPrinciple?.humanCapabilities && (
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="flex items-center gap-3 mb-8"
              initial={{}}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Lightbulb className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-purple-300">인간의 4가지 핵심 능력 (카드를 클릭해보세요! 🃏)</h3>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {humanSuperiorityPrinciple.humanCapabilities.map((cap, i) => (
                <FlipCard key={cap.id} capability={cap} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Philosophy principles timeline */}
        <div className="max-w-3xl mx-auto mt-16 space-y-4">
          {philosophy.principles.filter(p => !p.highlight).map((principle, index) => (
            <motion.div
              key={principle.id}
              className="flex gap-4 items-start"
              initial={{ x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <div className="flex flex-col items-center shrink-0">
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold"
                  whileHover={{ scale: 1.2, rotate: 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {index + 1}
                </motion.div>
                {index < philosophy.principles.filter(p => !p.highlight).length - 1 && (
                  <div className="w-0.5 h-full min-h-8 bg-gradient-to-b from-purple-500/40 to-transparent mt-2" />
                )}
              </div>
              <div
                className="flex-1 rounded-2xl p-5 mb-4 border border-white/8 bg-white/[0.02] hover:border-white/15 transition-colors"
              >
                <h3 className="text-base font-bold text-white mb-2">{principle.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{principle.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
