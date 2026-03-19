'use client';

import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const manifesto = homeContent.manifesto as typeof homeContent.manifesto;

export function ManifestoSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={80} />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/12 to-black pointer-events-none" />

      <div className="web-container relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
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
          <p className="text-white/45 text-base max-w-md mx-auto mb-2">
            {manifesto.header.subtitle}
          </p>
          {(manifesto.header as { intro?: string }).intro && (
            <p className="text-white/50 text-sm max-w-2xl mx-auto">
              {(manifesto.header as { intro: string }).intro}
            </p>
          )}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
          {manifesto.cards.map((card, i) => (
            <div
              key={card.title}
              className="group relative rounded-3xl p-7 border transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
              style={{ background: card.colorBg, borderColor: card.colorBorder }}
            >
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 50px ${card.color}20` }}
              />

              <div className="flex items-start justify-between mb-4">
                <div
                  className="text-4xl"
                  style={{ animation: `icon-float ${3.5 + i * 0.4}s ease-in-out ${i * 0.5}s infinite` }}
                >
                  {card.emoji}
                </div>
                <div className="flex gap-1.5">
                  {card.icons.map((icon, j) => (
                    <span key={j} className="text-xl opacity-60 group-hover:opacity-100 transition-opacity">
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

              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
