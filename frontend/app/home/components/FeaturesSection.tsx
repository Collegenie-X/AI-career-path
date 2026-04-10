'use client';

import homeContent from '@/data/home-content.json';

const features = homeContent.features as typeof homeContent.features;

export function FeaturesSection() {
  return (
    <section className="relative py-28 md:py-40 overflow-hidden px-6 md:px-10 lg:px-16">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(108,92,231,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="web-container relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">
            {features.header.badge}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {features.header.title}
          </h2>
          <p className="text-white/45 text-base max-w-sm mx-auto">
            {features.header.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {features.items.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] cursor-default overflow-hidden"
              style={{
                background: `${f.color}08`,
                borderColor: `${f.color}25`,
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `inset 0 0 30px ${f.color}15, 0 0 30px ${f.color}20` }}
              />

              <div className="flex justify-between items-start mb-3">
                <span
                  className="text-[10px] font-extrabold px-2 py-0.5 rounded-full tracking-wider"
                  style={{ background: `${f.color}20`, color: f.color }}
                >
                  {f.tag}
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ background: f.color, boxShadow: `0 0 6px ${f.color}` }}
                />
              </div>

              <div
                className="text-4xl mb-3 transition-transform group-hover:scale-110 duration-300 flex justify-center"
                style={{ filter: `drop-shadow(0 0 8px ${(f as { glow?: string }).glow ?? f.color + '80'})` }}
              >
                {f.emoji}
              </div>

              <h3 className="text-sm font-bold text-white mb-1 leading-tight text-center">{f.title}</h3>
              <p className="text-xs text-white/45 leading-snug text-center">{f.desc}</p>

              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
