'use client';

import { motion } from 'framer-motion';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const manifesto = homeContent.manifesto as typeof homeContent.manifesto;

const cardVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    x: i % 2 === 0 ? -60 : 60,
    y: 20,
  }),
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.65,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export function ManifestoSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={80} />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/12 to-black pointer-events-none" />

      <div className="web-container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
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
            <p className="text-white/50 text-sm max-w-2xl mx-auto">
              {(manifesto.header as { intro: string }).intro}
            </p>
          )}
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
          {manifesto.cards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="group relative rounded-3xl p-7 border overflow-hidden cursor-default"
              style={{ background: card.colorBg, borderColor: card.colorBorder }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ boxShadow: `0 0 50px ${card.color}20` }}
              />

              {/* Animated background gradient on hover */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at 30% 30%, ${card.color}10 0%, transparent 70%)`,
                }}
              />

              <div className="flex items-start justify-between mb-4">
                <motion.div
                  className="text-4xl"
                  animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
                  transition={{
                    duration: 3.5 + i * 0.4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5,
                  }}
                >
                  {card.emoji}
                </motion.div>
                <div className="flex gap-1.5">
                  {card.icons.map((icon, j) => (
                    <span
                      key={j}
                      className="text-xl opacity-40 group-hover:opacity-100 transition-all duration-300"
                      style={{ transitionDelay: `${j * 60}ms` }}
                    >
                      {icon}
                    </span>
                  ))}
                </div>
              </div>

              <span
                className="inline-block text-xs font-extrabold px-3 py-1 rounded-full mb-3 uppercase tracking-wider"
                style={{ background: `${card.color}20`, color: card.color }}
              >
                {card.short}
              </span>

              <h3 className="text-lg font-bold text-white mb-3 leading-snug">{card.title}</h3>

              {(card as { description?: string }).description && (
                <p className="text-sm text-white/60 leading-relaxed mb-3">
                  {(card as { description: string }).description}
                </p>
              )}

              <blockquote
                className="text-sm italic text-white/55 pl-3 border-l-2 leading-relaxed"
                style={{ borderColor: card.color }}
              >
                {card.quote}
              </blockquote>

              {/* Bottom accent */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                initial={{ scaleX: 0, opacity: 0 }}
                whileHover={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
                  transformOrigin: 'center',
                }}
              />

              {/* Corner accent */}
              <div
                className="absolute top-3 right-3 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: card.color,
                  boxShadow: `0 0 8px ${card.color}`,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
