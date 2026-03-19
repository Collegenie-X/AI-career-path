'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { CTASection as CTASectionType } from '../types';

interface CTASectionProps {
  data: CTASectionType;
}

export function CTASection({ data }: CTASectionProps) {
  const router = useRouter();

  return (
    <motion.section
      className="rounded-3xl p-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(108,92,231,0.1))',
        border: '1.5px solid rgba(108,92,231,0.35)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {/* Background Decorations */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-purple-500/20 blur-3xl" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-blue-500/20 blur-2xl" />

      {/* Content */}
      <div className="relative z-10 text-center">
        <motion.div
          className="inline-flex items-center gap-2 mb-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-bold text-purple-300 uppercase tracking-wider">
            시작하기
          </span>
        </motion.div>

        <motion.h2
          className="text-2xl font-bold text-white mb-2 leading-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {data.title}
        </motion.h2>

        <motion.p
          className="text-sm text-gray-300 mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {data.description}
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <button
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)',
              boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
            }}
            onClick={() => router.push(data.primaryButton.href)}
          >
            <span>{data.primaryButton.text}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all active:scale-95"
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onClick={() => router.push(data.secondaryButton.href)}
          >
            <span>{data.secondaryButton.text}</span>
          </button>
        </motion.div>
      </div>
    </motion.section>
  );
}
