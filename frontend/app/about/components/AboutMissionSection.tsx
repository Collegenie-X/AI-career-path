'use client';

import { Target, Eye, Heart } from 'lucide-react';
import aboutContent from '@/data/about-content.json';

const ICON_MAP = {
  target: Target,
  eye: Eye,
  heart: Heart,
} as const;

export function AboutMissionSection() {
  const { mission } = aboutContent;

  return (
    <section className="py-24 md:py-32 bg-white/[0.015]">
      <div className="web-container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {mission.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{mission.title}</h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {mission.values.map((value, index) => {
            const Icon = ICON_MAP[value.icon as keyof typeof ICON_MAP];
            return (
              <div
                key={value.id}
                className="rounded-2xl p-7 bg-white/[0.03] border border-white/8 hover:border-white/18 hover:scale-105 transition-all duration-300 group"
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 100}ms both` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${value.color}18` }}
                >
                  <Icon className="w-5 h-5" style={{ color: value.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{value.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
