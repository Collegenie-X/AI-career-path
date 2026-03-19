'use client';

import { useState } from 'react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const persona = homeContent.persona as typeof homeContent.persona;

type Persona = (typeof persona.personas)[number] & { colorBg?: string; colorBorder?: string };

function XpBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs text-white/40 w-8 text-right">{value}xp</span>
    </div>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  );
}

export function PersonaSection() {
  const [activeId, setActiveId] = useState<string>(persona.personas[0].id);
  const active = persona.personas.find((p) => p.id === activeId) ?? persona.personas[0];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <StarfieldCanvas count={60} />
      <div className="web-container relative z-10">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">{persona.header.badge}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {persona.header.title}
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            {persona.header.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {persona.personas.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-semibold text-sm transition-all border ${
                activeId === p.id
                  ? 'text-white scale-105'
                  : 'text-white/50 hover:text-white/80 border-white/8 hover:border-white/20'
              }`}
              style={
                activeId === p.id
                  ? { background: `${p.color}18`, borderColor: (p as Persona).colorBorder ?? `${p.color}40`, color: p.color }
                  : {}
              }
            >
              <span className="text-xl">{p.emoji}</span>
              <div className="text-left">
                <div className="text-xs opacity-70">{p.level} {p.badge}</div>
                <div>{p.name.split(' · ')[0]}</div>
              </div>
            </button>
          ))}
        </div>

        <div
          key={active.id}
          className="rounded-3xl overflow-hidden border transition-all"
          style={{ borderColor: (active as Persona).colorBorder ?? `${active.color}40`, background: (active as Persona).colorBg ?? `${active.color}08` }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/8">
              <div className="flex items-start gap-5 mb-7">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 border"
                  style={{ background: `${active.color}15`, borderColor: (active as Persona).colorBorder ?? `${active.color}40` }}
                >
                  {active.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${active.color}25`, color: active.color }}
                    >
                      {active.level} · {active.badge}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{active.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {active.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/8 text-white/55">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-7">
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-white/40 font-medium">EXPERIENCE</span>
                  <span className="text-xs font-bold" style={{ color: active.color }}>
                    {active.xp} / {active.maxXp} XP
                  </span>
                </div>
                <XpBar value={active.xp} max={active.maxXp} color={active.color} />
              </div>

              <div className="space-y-3">
                {active.stats.map((stat) => (
                  <StatBar key={stat.label} label={stat.label} value={stat.value} color={active.color} />
                ))}
              </div>
            </div>

            <div className="p-8 md:p-10 flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">{persona.labels.pain}</p>
                <blockquote
                  className="text-base md:text-lg font-medium text-white/85 italic leading-relaxed pl-4 border-l-2"
                  style={{ borderColor: active.color }}
                >
                  {active.pain}
                </blockquote>
              </div>

              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">{persona.labels.goal}</p>
                <p className="text-base font-semibold text-white">{active.goal}</p>
              </div>

              <div
                className="rounded-2xl p-5 border"
                style={{ background: `${active.color}10`, borderColor: `${active.color}30` }}
              >
                <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: active.color }}>
                  {persona.labels.dreampath}
                </p>
                <p className="text-sm text-white/75 leading-relaxed font-medium">{active.dreampath}</p>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <span className="text-2xl">🆓</span>
                <p className="text-sm text-white/55 whitespace-pre-line">
                  {persona.labels.freeNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
