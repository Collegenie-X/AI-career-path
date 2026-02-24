'use client';

import { motion } from 'framer-motion';
import type { HeroSection as HeroSectionType } from '../types';

interface HeroSectionProps {
  data: HeroSectionType;
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <motion.section
      className="relative rounded-3xl overflow-hidden p-8 mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.3) 0%, rgba(59,130,246,0.2) 100%)',
        border: '2px solid rgba(108,92,231,0.4)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Emoji */}
      <div className="absolute top-4 right-6 text-8xl opacity-10 pointer-events-none">
        {data.backgroundEmoji}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <motion.div
          className="inline-block px-4 py-1.5 rounded-full mb-4"
          style={{
            background: 'rgba(108,92,231,0.2)',
            border: '1px solid rgba(108,92,231,0.4)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm font-bold text-purple-300">✨ NEW</span>
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-white mb-3 leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {data.title}
        </motion.h1>

        <motion.p
          className="text-lg font-semibold text-purple-200 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {data.subtitle}
        </motion.p>

        <motion.p
          className="text-sm text-gray-300 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {data.description}
        </motion.p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl" />
      <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
    </motion.section>
  );
}
