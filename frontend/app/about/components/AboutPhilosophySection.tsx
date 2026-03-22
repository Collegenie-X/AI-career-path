'use client';

import { Lightbulb, Target, Users, Zap, Search } from 'lucide-react';
import aboutContent from '@/data/about-content.json';

const iconMap = {
  target: Target,
  users: Users,
  zap: Zap,
  search: Search,
};

export function AboutPhilosophySection() {
  const { philosophy } = aboutContent;

  return (
    <section className="py-24 md:py-32 bg-white/[0.015]">
      <div className="web-container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {philosophy.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{philosophy.title}</h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">{philosophy.subtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {philosophy.principles.map((principle, index) => (
            <div key={principle.id}>
              <div
                className={`rounded-2xl p-7 md:p-8 border transition-all duration-300 ${
                  principle.highlight
                    ? 'bg-gradient-to-br from-purple-500/15 to-blue-500/15 border-purple-500/40 hover:border-purple-500/60'
                    : 'bg-white/[0.03] border-white/8 hover:border-white/12'
                }`}
                style={{ animation: `fadeInUp 0.6s ease-out ${index * 100}ms both` }}
              >
                <div className="flex items-start gap-4">
                  {principle.highlight && (
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Lightbulb className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold mb-3 ${
                        principle.highlight ? 'text-purple-300' : 'text-white'
                      }`}
                    >
                      {principle.title}
                    </h3>
                    <p className="text-base text-white/65 leading-relaxed">{principle.content}</p>
                  </div>
                </div>
              </div>

              {principle.humanCapabilities && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {principle.humanCapabilities.map((capability, capIndex) => {
                    const IconComponent = iconMap[capability.icon as keyof typeof iconMap];
                    return (
                      <div
                        key={capability.id}
                        className="rounded-xl p-6 bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all duration-300"
                        style={{
                          animation: `fadeInUp 0.6s ease-out ${
                            index * 100 + (capIndex + 1) * 80
                          }ms both`,
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                            <IconComponent className="w-4 h-4 text-purple-300" />
                          </div>
                          <h4 className="text-base font-bold text-purple-200 leading-tight">
                            {capability.title}
                          </h4>
                        </div>
                        <p className="text-sm text-white/55 leading-relaxed">
                          {capability.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
