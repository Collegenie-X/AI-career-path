'use client';

import { motion } from 'framer-motion';
import type { StatsSection as StatsSectionType } from '../types';

interface StatsSectionProps {
  data: StatsSectionType;
}

export function StatsSection({ data }: StatsSectionProps) {
  return (
    <section className="mb-6">
      <motion.h2
        className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        📊 {data.title}
      </motion.h2>

      <div className="grid grid-cols-2 gap-3">
        {data.items.map((item, index) => (
          <motion.div
            key={index}
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Background Glow */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at top right, ${item.color}33, transparent)`,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
              <div className="text-xs text-gray-400">{item.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
