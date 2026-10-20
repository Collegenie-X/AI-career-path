'use client';

import { useState } from 'react';
import { GlossaryText } from '@/components/shared/GlossaryText';
import type { HighSchoolCareerBridge, HighSchoolCareerPathway, HighSchoolHiringSupport, SchoolSourceLink } from '../../types';

/** ==형광펜== + 입시 약어 툴팁 렌더 */
function HL({ text }: { text: string }) {
  return <GlossaryText>{text}</GlossaryText>;
}

/** 제도 성격 뱃지 — "의무인지, 목표인지, 자율인지"를 한눈에 */
const KIND_BADGE: Record<HighSchoolHiringSupport['kind'], { label: string; color: string }> = {
  law: { label: '법정 제도', color: '#f87171' },
  target: { label: '정부 목표제', color: '#60a5fa' },
  voluntary: { label: '기업 자율', color: '#a78bfa' },
  money: { label: '지원금·세제', color: '#34d399' },
  military: { label: '병역', color: '#fbbf24' },
};

function SourceLinks({ sources, color }: { sources: SchoolSourceLink[]; color: string }) {
  if (!sources.length) return null;
  return (
    <div className="flex flex-wrap gap-x-2.5 gap-y-1 mt-2">
      {sources.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10.5px] underline decoration-dotted underline-offset-2 hover:opacity-80"
          style={{ color: `${color}cc` }}
        >
          📎 {s.label} ↗
        </a>
      ))}
    </div>
  );
}

function Row({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex gap-2 text-[12px] leading-relaxed">
      <span className="shrink-0 w-[52px] text-gray-500 font-semibold">{label}</span>
      <span className="text-gray-200">
        <HL text={text} />
      </span>
    </div>
  );
}

/** 직업계고 졸업 후 경로 — 선취업 후진학 3경로 + 고졸 채용 할당·지원 제도 */
export function CareerBridgeSection({
  bridge,
  color,
  bgColor,
}: {
  bridge?: HighSchoolCareerBridge;
  color: string;
  bgColor: string;
}) {
  const [openHiring, setOpenHiring] = useState<string | null>(null);
  const [view, setView] = useState<'college' | 'job'>('college');
  if (!bridge) return null;

  const box = {
    background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
    border: `1px solid ${color}33`,
  };

  const switches = [
    { id: 'college' as const, emoji: '🎓', label: '대학 진학', sub: `${bridge.pathways.length}가지 길` },
    { id: 'job' as const, emoji: '💼', label: '취업 혜택', sub: `${bridge.hiring.length}가지 제도` },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `2px solid ${color}66`, boxShadow: `0 4px 20px ${color}25` }}
    >
      {/* ── 배너: 대학도, 취업도 ── */}
      <div
        className="px-4 pt-4 pb-3"
        style={{ background: `linear-gradient(135deg, ${color}30 0%, ${bgColor} 60%, rgba(0,0,0,0.2) 100%)` }}
      >
        <p className="text-[11px] font-bold tracking-wider" style={{ color }}>졸업 후 두 갈래 길</p>
        <p className="text-[17px] font-black text-white leading-snug mt-0.5">🎓 대학도 가고 💼 취업도 한다</p>
        <p className="text-[11.5px] text-gray-300 leading-relaxed mt-1">
          <HL text={bridge.bannerLine ?? bridge.pathwayHeadline} />
        </p>
        <div className="flex gap-1.5 mt-3 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
          {switches.map((sw) => {
            const on = view === sw.id;
            return (
              <button
                key={sw.id}
                type="button"
                onClick={() => setView(sw.id)}
                className="flex-1 py-2 rounded-lg flex flex-col items-center transition-all active:scale-[0.98]"
                style={{
                  background: on ? `${color}45` : 'transparent',
                  color: on ? '#fff' : '#9ca3af',
                  boxShadow: on ? `0 2px 10px ${color}40` : 'none',
                }}
                aria-pressed={on}
              >
                <span className="text-[13.5px] font-bold">{sw.emoji} {sw.label}</span>
                <span className="text-[10.5px]" style={{ color: on ? color : '#6b7280' }}>{sw.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
      {/* ── 1. 선취업 후진학 경로 ── */}
      {view === 'college' && <CollegeView bridge={bridge} color={color} box={box} />}

      {/* ── 2. 고졸 채용 할당·지원 제도 ── */}
      {view === 'job' && (
      <div className="rounded-2xl p-3.5" style={box}>
        <p className="text-[13px] font-bold" style={{ color }}>{bridge.hiringTitle}</p>
        <p className="text-[11.5px] text-gray-300 leading-relaxed mt-1">
          <HL text={bridge.hiringHeadline} />
        </p>

        {bridge.mythCheck && (
          <div
            className="mt-3 rounded-xl p-3"
            style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.35)' }}
          >
            <p className="text-[12px] text-gray-300">
              💬 <span className="line-through decoration-gray-500">{bridge.mythCheck.claim}</span>
            </p>
            <p className="text-[12.5px] font-bold text-sky-300 mt-1">
              👉 <HL text={bridge.mythCheck.verdict} />
            </p>
            <p className="text-[11.5px] text-gray-300 leading-relaxed mt-1">
              <HL text={bridge.mythCheck.detail} />
            </p>
          </div>
        )}

        <div className="mt-3 space-y-2">
          {bridge.hiring.map((h) => {
            const badge = KIND_BADGE[h.kind];
            const open = openHiring === h.id;
            return (
              <div
                key={h.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${open ? `${badge.color}66` : 'rgba(255,255,255,0.08)'}` }}
              >
                <button
                  type="button"
                  onClick={() => setOpenHiring(open ? null : h.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-[16px] shrink-0">{h.emoji}</span>
                  <span className="flex-1 min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[12.5px] font-bold text-white">{h.label}</span>
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none"
                        style={{ background: `${badge.color}22`, color: badge.color, border: `1px solid ${badge.color}66` }}
                      >
                        {badge.label}
                      </span>
                      <span className="text-[10px] text-gray-500">{h.forWhom}</span>
                    </span>
                    {h.numbers && (
                      <span className="block text-[11px] font-semibold mt-0.5" style={{ color: badge.color }}>
                        <HL text={h.numbers} />
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-gray-500 shrink-0">{open ? '▲' : '▼'}</span>
                </button>
                {open && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <p className="text-[12px] text-gray-200 leading-relaxed">
                      <HL text={h.what} />
                    </p>
                    {h.howToUse && (
                      <p className="text-[11.5px] text-emerald-200/90 leading-relaxed">
                        ✅ <HL text={h.howToUse} />
                      </p>
                    )}
                    <SourceLinks sources={h.sources} color={badge.color} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
      <p className="text-[10px] text-gray-500 mt-2 px-1">기준: {bridge.asOf} · 금액·인원은 매년 바뀌니 링크 원문으로 다시 확인하세요.</p>
      </div>
    </div>
  );
}

/** 언제 가는 길인가 — 시점 그룹 */
const STAGES: Array<{ id: NonNullable<HighSchoolCareerPathway['stage']>; emoji: string; label: string; sub: string }> = [
  { id: 'grade12', emoji: '🏫', label: '고3 때 바로', sub: '졸업과 동시에 대학생' },
  { id: 'onJob', emoji: '🏭', label: '입사 직후', sub: '회사 다니며 1학년부터' },
  { id: 'afterWork', emoji: '⏳', label: '3년 일한 뒤', sub: '경력으로 명문대 문 열기' },
];

/** 대학 진학 탭 — 한눈에 비교 → 시점별 그룹 → 경로 카드 → 다른 길 */
function CollegeView({
  bridge,
  color,
  box,
}: {
  bridge: HighSchoolCareerBridge;
  color: string;
  box: React.CSSProperties;
}) {
  const [openPathway, setOpenPathway] = useState<string | null>(bridge.pathways[0]?.id ?? null);
  const pathways = bridge.pathways;
  const factLabels = pathways[0]?.keyFacts?.map((f) => f.label) ?? [];
  const grouped = STAGES.map((st) => ({ ...st, items: pathways.filter((p) => p.stage === st.id) })).filter(
    (g) => g.items.length > 0,
  );
  const ungrouped = pathways.filter((p) => !p.stage);

  const openAndScroll = (id: string) => {
    setOpenPathway(id);
    requestAnimationFrame(() => document.getElementById(`pathway-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-3.5" style={box}>
        <p className="text-[14px] font-bold" style={{ color }}>{bridge.pathwayTitle}</p>
        <p className="text-[12px] text-gray-300 leading-relaxed mt-1">
          <HL text={bridge.pathwayHeadline} />
        </p>

        {/* ── 한눈에 비교 표 ── */}
        {factLabels.length > 0 && (
          <div className="mt-3 overflow-x-auto rounded-xl" style={{ border: `1px solid ${color}2a` }}>
            <table className="w-full text-left border-collapse" style={{ minWidth: 120 + pathways.length * 150 }}>
              <thead>
                <tr style={{ background: `${color}18` }}>
                  <th className="px-2 py-2 text-[11px] text-gray-400 font-semibold w-[84px]">한눈에 비교</th>
                  {pathways.map((p) => (
                    <th key={p.id} className="px-2 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => openAndScroll(p.id)}
                        className="text-left text-[12px] font-bold text-white hover:underline"
                      >
                        <span style={{ color }}>{p.no}</span> {p.emoji} {p.title}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {factLabels.map((label) => (
                  <tr key={label} className="border-t align-top" style={{ borderColor: `${color}1f` }}>
                    <td className="px-2 py-2 text-[11px] font-semibold text-gray-400 whitespace-nowrap">{label}</td>
                    {pathways.map((p) => (
                      <td key={p.id} className="px-2 py-2 text-[11.5px] text-gray-200 leading-snug">
                        <HL text={p.keyFacts?.find((f) => f.label === label)?.value ?? '—'} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 언제 가는 길인가 (시점 레인) ── */}
        {grouped.length > 0 && (
          <div className="mt-3 flex items-stretch gap-1 overflow-x-auto">
            {grouped.map((g, i) => (
              <div key={g.id} className="flex items-stretch gap-1 flex-1 min-w-[150px]">
                <div className="flex-1 rounded-xl p-2.5" style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${color}2a` }}>
                  <p className="text-[12px] font-bold text-white">{g.emoji} {g.label}</p>
                  <p className="text-[10.5px] text-gray-500 mb-1.5">{g.sub}</p>
                  <div className="flex flex-col gap-1">
                    {g.items.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => openAndScroll(p.id)}
                        className="text-left px-2 py-1 rounded-lg text-[11.5px] font-semibold"
                        style={{ background: `${color}1f`, color, border: `1px solid ${color}44` }}
                      >
                        {p.no} {p.title}
                      </button>
                    ))}
                  </div>
                </div>
                {i < grouped.length - 1 && <span className="self-center text-[13px]" style={{ color }}>→</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 경로 카드 (시점별 그룹) ── */}
      {[...grouped, ...(ungrouped.length ? [{ id: 'etc', emoji: '📌', label: '그 밖의 길', sub: '', items: ungrouped }] : [])].map((g) => (
        <div key={g.id} className="space-y-2">
          <p className="text-[12px] font-bold px-1" style={{ color }}>
            {g.emoji} {g.label} <span className="text-gray-500 font-normal">· {g.sub}</span>
          </p>
          {g.items.map((p) => (
            <PathwayCard
              key={p.id}
              p={p}
              color={color}
              open={openPathway === p.id}
              onToggle={() => setOpenPathway(openPathway === p.id ? null : p.id)}
            />
          ))}
        </div>
      ))}

      {/* ── 고르는 순서 ── */}
      {bridge.pathwayPick && bridge.pathwayPick.length > 0 && (
        <div className="rounded-2xl p-3.5" style={box}>
          <p className="text-[12.5px] font-bold mb-2" style={{ color }}>🧭 나한테 맞는 길 고르기</p>
          <ol className="space-y-1.5">
            {bridge.pathwayPick.map((line, i) => (
              <li key={line} className="text-[12px] text-gray-200 leading-relaxed flex gap-2">
                <span
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10.5px] font-black"
                  style={{ background: `${color}25`, color }}
                >
                  {i + 1}
                </span>
                <span><HL text={line} /></span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── 다른 길 ── */}
      {bridge.otherRoutes && bridge.otherRoutes.length > 0 && (
        <div className="rounded-2xl p-3.5" style={box}>
          <p className="text-[12.5px] font-bold mb-2" style={{ color }}>➕ 이것도 대학이에요 — 다른 길</p>
          <div className="space-y-1.5">
            {bridge.otherRoutes.map((r) => (
              <div key={r.name} className="flex gap-2 text-[12px] leading-relaxed">
                <span className="shrink-0">{r.emoji}</span>
                <span className="text-gray-200">
                  <span className="font-bold text-white">{r.name}</span> — <HL text={r.summary} />
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-[10.5px] underline decoration-dotted"
                      style={{ color: `${color}cc` }}
                    >
                      출처 ↗
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PathwayCard({
  p,
  color,
  open,
  onToggle,
}: {
  p: HighSchoolCareerPathway;
  color: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      id={`pathway-${p.id}`}
      className="rounded-xl overflow-hidden scroll-mt-20"
      style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${open ? `${color}77` : `${color}22`}` }}
    >
      <button type="button" onClick={onToggle} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left" aria-expanded={open}>
        <span
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-black"
          style={{ background: `${color}25`, color, border: `2px solid ${color}88` }}
        >
          {p.no}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-bold text-white">{p.emoji} {p.title}</span>
          <span className="block text-[11.5px] text-gray-400 leading-snug mt-0.5">
            <HL text={p.oneLine} />
          </span>
        </span>
        <span className="text-[11px] text-gray-500 shrink-0">{open ? '접기 ▲' : '펼치기 ▼'}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3">
          {p.stat && (
            <p className="text-[12px] font-bold px-2.5 py-1.5 rounded-lg" style={{ background: `${color}14`, color }}>
              📊 <HL text={p.stat} />
            </p>
          )}

          {/* 핵심 사실 타일 */}
          {p.keyFacts && p.keyFacts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {p.keyFacts.map((f) => (
                <div key={f.label} className="rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-[10.5px] text-gray-500 font-semibold">{f.label}</p>
                  <p className="text-[12px] text-gray-100 leading-snug mt-0.5"><HL text={f.value} /></p>
                </div>
              ))}
            </div>
          )}

          {/* 진행 순서 */}
          <div>
            <p className="text-[11px] text-gray-500 font-semibold mb-1">진행 순서</p>
            <ol className="space-y-1">
              {p.flow.map((step, i) => (
                <li key={step} className="flex items-center gap-2 text-[12px] text-gray-200">
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: `${color}25`, color }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-1">
            <Row label="지원 자격" text={p.who} />
            <Row label="학비" text={p.cost} />
          </div>

          {/* 대학별 모집 */}
          {p.schools && p.schools.length > 0 ? (
            <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {p.schools.map((sc, i) => (
                <div
                  key={sc.name}
                  className="flex gap-2 px-2.5 py-1.5 text-[11.5px]"
                  style={{ background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.03)' }}
                >
                  <span className="shrink-0 w-[96px] font-bold text-white">🏫 {sc.name}</span>
                  <span className="text-gray-300 leading-snug"><HL text={sc.detail} /></span>
                </div>
              ))}
            </div>
          ) : (
            p.examples.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.examples.map((ex) => (
                  <span
                    key={ex}
                    className="px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    🏫 {ex}
                  </span>
                ))}
              </div>
            )
          )}

          {p.caution && (
            <p
              className="text-[11.5px] text-amber-200/90 leading-relaxed rounded-lg px-2.5 py-2"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
            >
              ⚠️ <HL text={p.caution} />
            </p>
          )}

          <SourceLinks sources={p.sources} color={color} />
        </div>
      )}
    </div>
  );
}
