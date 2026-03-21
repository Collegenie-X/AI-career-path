'use client';

import { Lightbulb, RefreshCw, Users, FileText } from 'lucide-react';
import aboutContent from '@/data/about-content.json';

const ICON_MAP = {
  'lightbulb': Lightbulb,
  'refresh-cw': RefreshCw,
  'users': Users,
  'file-text': FileText,
} as const;

export function AboutWorkStyleSection() {
  const { workStyle } = aboutContent;

  return (
    <section className="py-24 md:py-32">
      <div className="web-container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {workStyle.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{workStyle.title}</h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {workStyle.items.map((item, index) => {
            const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
            return (
              <div
                key={item.id}
                className="rounded-2xl p-7 bg-white/[0.03] border border-white/8 hover:border-purple-500/30 hover:scale-105 transition-all duration-300 group"
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 100}ms both` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
