'use client';

import { motion } from 'framer-motion';
import { Map, CalendarX, Lock, AlertCircle, Database, Bot, Users, FileText } from 'lucide-react';
import aboutContent from '@/data/about-content.json';

const ICON_MAP = {
  'map-off': Map,
  'calendar-x': CalendarX,
  lock: Lock,
  'alert-circle': AlertCircle,
  database: Database,
  bot: Bot,
  users: Users,
  'file-text': FileText,
} as const;

export function AboutProblemSolutionSectionNew() {
  const { problemSolution } = aboutContent;

  return (
    <section className="py-24 md:py-32 bg-white/[0.015] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-purple-500/20 to-transparent" />
      </div>

      <div className="web-container relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {problemSolution.badge}
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{problemSolution.title}</h2>
        </motion.div>

        {/* Problems */}
        <div className="mb-16">
          <motion.div
            className="flex items-center justify-center gap-3 mb-8"
            initial={{}}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-500/40" />
            <span className="px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-bold">
              😰 문제점
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-500/40" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {problemSolution.problems.map((problem, index) => {
              const Icon = ICON_MAP[problem.icon as keyof typeof ICON_MAP];
              return (
                <motion.div
                  key={problem.id}
                  className="rounded-2xl p-6 bg-white/[0.03] border border-red-500/15 hover:border-red-500/35 transition-all duration-300 group relative overflow-hidden"
                  initial={{ y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                >
                  <motion.div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${problem.color}18` }}
                    whileHover={{ rotate: 15, scale: 1.1 }}
                  >
                    <Icon className="w-5 h-5" style={{ color: problem.color }} />
                  </motion.div>
                  <h3 className="text-sm font-bold text-white mb-2">{problem.title}</h3>
                  <p className="text-xs text-white/50 leading-relaxed">{problem.description}</p>

                  {/* Problem number */}
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold">
                    {index + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Arrow */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="flex flex-col items-center gap-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl"
            >
              ↓
            </motion.div>
            <div
              className="px-6 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #3B82F6)' }}
            >
              AI CareerPath 솔루션 🚀
            </div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="text-2xl"
            >
              ↓
            </motion.div>
          </div>
        </motion.div>

        {/* Solutions */}
        <div>
          <motion.div
            className="flex items-center justify-center gap-3 mb-8"
            initial={{}}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-500/40" />
            <span className="px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-sm font-bold">
              ✨ 해결책
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-500/40" />
          </motion.div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {problemSolution.solution.features.map((feature, index) => {
              const Icon = ICON_MAP[feature.icon as keyof typeof ICON_MAP];
              return (
                <motion.div
                  key={feature.id}
                  className="rounded-2xl p-7 border border-purple-500/20 group relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(59,130,246,0.08))' }}
                  initial={{ y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(168,85,247,0.5)' }}
                >
                  {/* Glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{ background: 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.15), transparent 60%)' }}
                  />

                  <div className="flex items-start gap-4 relative z-10">
                    <motion.div
                      className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>

                  {/* Check badge */}
                  <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs">
                    ✓
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
