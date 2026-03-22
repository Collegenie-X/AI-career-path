'use client';

import { Gift, Sparkles, Info } from 'lucide-react';
import aboutContent from '@/data/about-content.json';

const ICON_MAP = {
  gift: Gift,
  sparkles: Sparkles,
} as const;

export function AboutAIUsageSection() {
  const { aiUsage } = aboutContent;

  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="web-container">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {aiUsage.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{aiUsage.title}</h2>
          <p className="text-base text-white/50 max-w-3xl mx-auto">{aiUsage.subtitle}</p>
        </div>

        <p className="text-center text-sm text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          {aiUsage.intro}
        </p>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {aiUsage.tiers.map((tier, index) => {
            const Icon = ICON_MAP[tier.icon as keyof typeof ICON_MAP];
            return (
              <div
                key={tier.id}
                className="rounded-2xl p-8 border transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: tier.colorBg,
                  borderColor: tier.colorBorder,
                  animation: `fadeInUp 0.6s ease-out ${index * 150}ms both`,
                }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tier.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: tier.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{tier.title}</h3>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-extrabold" style={{ color: tier.color }}>
                        {tier.price}
                      </p>
                      {tier.priceNote && (
                        <p className="text-xs text-white/40">{tier.priceNote}</p>
                      )}
                    </div>
                  </div>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2.5 text-sm text-white/65">
                      <span className="text-base flex-shrink-0" style={{ color: tier.color }}>
                        ✓
                      </span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div
          className="max-w-4xl mx-auto rounded-2xl p-8 border"
          style={{
            background: 'rgba(99,102,241,0.06)',
            borderColor: 'rgba(99,102,241,0.2)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)' }}
            >
              <Info className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">{aiUsage.explanation.title}</h4>
              <p className="text-sm text-white/60 leading-relaxed mb-3">
                {aiUsage.explanation.content}
              </p>
              <p className="text-xs text-indigo-300 font-medium">{aiUsage.explanation.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
