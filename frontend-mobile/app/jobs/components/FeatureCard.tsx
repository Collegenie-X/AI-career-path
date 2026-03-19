'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { FeatureSection } from '../types';

interface FeatureCardProps {
  feature: FeatureSection;
  index: number;
}

export function FeatureCard({ feature, index }: FeatureCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(feature.link.href);
  };

  return (
    <motion.button
      className="w-full rounded-2xl p-5 text-left transition-all active:scale-[0.98] group relative overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
      onClick={handleClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.1), transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.3), rgba(108,92,231,0.1))',
            border: '1px solid rgba(108,92,231,0.4)',
          }}
        >
          {feature.icon}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-1.5 leading-tight">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            {feature.description}
          </p>

          {/* Link */}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
            <span>{feature.link.text}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
