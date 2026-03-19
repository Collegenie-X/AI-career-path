'use client';

import { useState } from 'react';
import { Check, X, Minus } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import homeContent from '@/data/home-content.json';

const competitor = homeContent.competitor as typeof homeContent.competitor;

type GroupId = (typeof competitor.groups)[number]['id'];
type CellValue = 'yes' | 'no' | 'partial';

function CellBadge({ value, color }: { value: CellValue; color: string }) {
  if (value === 'yes') {
    return (
      <div className="flex justify-center">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Check className="w-4 h-4" style={{ color }} />
        </div>
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="flex justify-center">
        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-400/10">
          <Minus className="w-4 h-4 text-amber-400/70" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <X className="w-4 h-4 text-white/15" />
    </div>
  );
}

function ScoreCard({ group }: { group: (typeof competitor.groups)[number] }) {
  const features = competitor.features;
  const yesCount = features.filter((f) => (f.values as Record<string, string>)[group.id] === 'yes').length;
  const partialCount = features.filter((f) => (f.values as Record<string, string>)[group.id] === 'partial').length;
  const score = Math.round(((yesCount + partialCount * 0.5) / features.length) * 100);

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${group.isUs ? 'scale-[1.02]' : ''}`}
      style={{ background: group.colorBg ?? `${group.color}10`, borderColor: `${group.color}30` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{group.emoji}</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${group.color}20`, color: group.color }}
        >
          {group.tag}
        </span>
      </div>
      <h4 className={`text-base font-bold mb-1 ${group.isUs ? 'text-purple-200' : 'text-white/80'}`}>
        {group.label}
      </h4>
      <p className="text-xs text-white/45 mb-4 leading-relaxed">{group.desc}</p>

      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-white/40">커버리지</span>
          <span className="text-sm font-extrabold" style={{ color: group.color }}>{score}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/8 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${score}%`,
              background: group.isUs
                ? 'linear-gradient(90deg, #6C5CE7, #a29bfe)'
                : group.color,
            }}
          />
        </div>
      </div>

      {group.isUs && (
        <div className="mt-3 text-xs text-purple-300 font-semibold flex items-center gap-1">
          ✨ 유일하게 전 구간 커버
        </div>
      )}
    </div>
  );
}

export function CompetitorTableSection() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white/[0.015]">
      <StarfieldCanvas count={50} />
      <div className="web-container relative z-10">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">{competitor.header.badge}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {competitor.header.title}
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            {competitor.header.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
          {competitor.groups.map((group) => (
            <ScoreCard key={group.id} group={group} />
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden border border-white/8">
          <div className="px-6 py-4 bg-white/[0.03] border-b border-white/8 flex items-center gap-2">
            <span className="text-base">⚔️</span>
            <p className="text-sm font-semibold text-white/70">기능별 상세 비교</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left px-6 py-4 text-sm text-white/40 font-medium w-48">기능</th>
                  {competitor.groups.map((g) => (
                    <th
                      key={g.id}
                      className={`px-3 py-4 text-center ${g.isUs ? 'bg-purple-500/8' : ''}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl">{g.emoji}</span>
                        <span
                          className={`text-xs font-bold leading-tight ${g.isUs ? 'text-purple-300' : 'text-white/55'}`}
                        >
                          {g.label}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitor.features.map((feature, rowIdx) => (
                  <tr
                    key={feature.label}
                    className={`border-b border-white/5 last:border-0 transition-colors cursor-default ${
                      hoveredRow === rowIdx ? 'bg-white/[0.03]' : rowIdx % 2 === 0 ? 'bg-white/[0.01]' : ''
                    }`}
                    onMouseEnter={() => setHoveredRow(rowIdx)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-2 text-sm text-white/70 font-medium">
                        <span>{feature.emoji}</span>
                        {feature.label}
                      </span>
                    </td>
                    {competitor.groups.map((g) => (
                      <td
                        key={g.id}
                        className={`px-3 py-3.5 ${g.isUs ? 'bg-purple-500/8' : ''}`}
                      >
                        <CellBadge
                          value={(feature.values as Record<string, CellValue>)[g.id] ?? 'no'}
                          color={g.color}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-white/35 px-1">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-green-400" /> {competitor.legend.yes}
          </span>
          <span className="flex items-center gap-1.5">
            <Minus className="w-3.5 h-3.5 text-amber-400/70" /> {competitor.legend.partial}
          </span>
          <span className="flex items-center gap-1.5">
            <X className="w-3.5 h-3.5 text-white/20" /> {competitor.legend.no}
          </span>
        </div>

        <div
          className="mt-12 rounded-2xl p-7 md:p-10 text-center border"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(59,130,246,0.06))',
            borderColor: 'rgba(108,92,231,0.2)',
          }}
        >
          <p className="text-2xl mb-3">🚀</p>
          <p className="text-xl md:text-2xl font-extrabold text-white mb-3">
            {competitor.footer.title}
          </p>
          <p className="text-white/55 text-sm md:text-base max-w-lg mx-auto">
            {competitor.footer.description}
          </p>
        </div>
      </div>
    </section>
  );
}
