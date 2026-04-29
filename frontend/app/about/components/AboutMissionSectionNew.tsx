'use client';

import { motion } from 'framer-motion';
import { Target, Eye, Heart } from 'lucide-react';
import aboutContent from '@/data/about-content.json';

const ICON_MAP = { target: Target, eye: Eye, heart: Heart } as const;

const VALUE_EMOJIS = ['🎯', '👁️', '💜'];

export function AboutMissionSectionNew() {
  const { mission } = aboutContent;

  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden">
      {/* Animated background lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full"
            style={{
              top: `${20 + i * 15}%`,
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 1.5 }}
          />
        ))}
      </div>

      <div className="web-container relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {mission.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{mission.title}</h2>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {mission.values.map((value, index) => {
            const Icon = ICON_MAP[value.icon as keyof typeof ICON_MAP];
            return (
              <motion.div
                key={value.id}
                className="relative rounded-3xl p-8 border border-white/8 bg-white/[0.03] group overflow-hidden"
                initial={{ y: 50, rotate: -3 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15, type: 'spring', stiffness: 80 }}
                whileHover={{
                  scale: 1.05,
                  rotate: 1,
                  borderColor: `${value.color}50`,
                  boxShadow: `0 20px 60px ${value.color}20`,
                }}
              >
                {/* Hover background */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${value.color}12, transparent 60%)` }}
                />

                {/* Big emoji */}
                <motion.div
                  className="text-4xl mb-4"
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, delay: index * 1 }}
                >
                  {VALUE_EMOJIS[index]}
                </motion.div>

                {/* Icon */}
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${value.color}20` }}
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="w-6 h-6" style={{ color: value.color }} />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{value.description}</p>

                {/* Bottom accent bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 rounded-b-3xl"
                  style={{ background: `linear-gradient(90deg, ${value.color}, transparent)` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: '60%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
