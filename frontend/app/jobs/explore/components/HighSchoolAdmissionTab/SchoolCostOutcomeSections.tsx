'use client';

import { useState } from 'react';
import { ChevronRight, ExternalLink } from 'lucide-react';
import type {
  HighSchoolDetail,
  SchoolSourceLink,
  SchoolCostQuickTile,
  SchoolCostPeriodTable,
  SchoolCostTone,
} from '../../types';
import { GlossaryText } from '../UniversityAdmissionTab/GlossaryText';

function HL({ text }: { text: string }) {
  return <GlossaryText>{text}</GlossaryText>;
}

function SectionShell({
  emoji, title, subtitle, color, children,
}: { emoji: string; title: string; subtitle?: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25` }}>
      <div className="mb-2">
        <p className="text-xs font-bold flex items-center gap-1.5" style={{ color }}>
          <span>{emoji}</span>
          {title}
        </p>
        {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function SourceList({ sources, color }: { sources?: SchoolSourceLink[]; color: string }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-2 pt-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: `${color}20` }}>
      <span className="text-[11px] text-gray-500">🔎 출처</span>
      {sources.map((s, i) => (
        <a
          key={i}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5 hover:opacity-80"
          style={{ background: `${color}15`, color }}
        >
          {s.label}
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      ))}
    </div>
  );
}

const TONE: Record<SchoolCostTone, { color: string; bg: string; border: string; tag: string }> = {
  free: { color: '#4ade80', bg: 'rgba(74,222,128,0.10)', border: 'rgba(74,222,128,0.30)', tag: '안 내는 돈' },
  pay: { color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.32)', tag: '내는 돈' },
  get: { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', border: 'rgba(96,165,250,0.30)', tag: '받는 돈' },
};
const toneOf = (t?: string) => (t && t in TONE ? TONE[t as SchoolCostTone] : null);

/** 등록금 한눈 요약 타일 */
function CostQuickTiles({ tiles, color }: { tiles: SchoolCostQuickTile[]; color: string }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 mb-2">
      {tiles.map((t, i) => {
        const tone = toneOf(t.tone);
        return (
          <div
            key={i}
            className="rounded-xl p-2.5"
            style={{
              background: tone?.bg ?? 'rgba(255,255,255,0.04)',
              border: `1px solid ${tone?.border ?? `${color}25`}`,
            }}
          >
            <p className="text-[10px] text-gray-400 leading-snug flex items-start gap-1">
              <span>{t.emoji}</span>
              <span className="flex-1">{t.label}</span>
            </p>
            <p className="text-base font-bold mt-1 leading-tight" style={{ color: tone?.color ?? color }}>
              {t.value}
            </p>
            {t.sub && <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{t.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}

/** 월 / 연 / 3년 환산 표 */
function CostPeriodTable({ table, color }: { table: SchoolCostPeriodTable; color: string }) {
  const [openRow, setOpenRow] = useState<number | null>(null);
  return (
    <div className="mt-2">
      <p className="text-[11px] font-bold text-gray-400 mb-1.5">🧮 {table.title ?? '월 / 연 / 3년으로 보면'}</p>
      <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <table className="w-full text-left" style={{ minWidth: 380 }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th className="text-[10px] font-semibold text-gray-400 px-2 py-1.5">항목</th>
              <th className="text-[10px] font-semibold text-gray-400 px-2 py-1.5 text-right">월</th>
              <th className="text-[10px] font-semibold text-gray-400 px-2 py-1.5 text-right">연</th>
              <th className="text-[10px] font-semibold text-gray-400 px-2 py-1.5 text-right">3년</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r, i) => {
              const tone = toneOf(r.tone);
              const open = openRow === i;
              return (
                <tr
                  key={i}
                  onClick={() => r.note && setOpenRow(open ? null : i)}
                  className={r.note ? 'cursor-pointer hover:bg-white/5' : ''}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <td className="px-2 py-1.5 align-top">
                    <span className="flex items-center gap-1">
                      {tone && (
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: tone.color }}
                          aria-label={tone.tag}
                        />
                      )}
                      <span className="text-[11px] text-gray-200 leading-snug">{r.label}</span>
                    </span>
                    {r.note && open && (
                      <span className="block text-[10px] text-gray-500 mt-1 leading-relaxed pl-2.5">
                        <HL text={r.note} />
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-[11px] text-right text-gray-300 align-top whitespace-nowrap">{r.monthly}</td>
                  <td className="px-2 py-1.5 text-[11px] text-right text-gray-300 align-top whitespace-nowrap">{r.yearly}</td>
                  <td
                    className="px-2 py-1.5 text-[11px] text-right font-semibold align-top whitespace-nowrap"
                    style={{ color: tone?.color ?? color }}
                  >
                    {r.threeYear}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-500 mt-1">💡 행을 누르면 설명이 열려요.</p>
      {table.note && (
        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
          <HL text={table.note} />
        </p>
      )}
    </div>
  );
}

/** ── 1. 등록금 구조: 그룹 → 항목 트리 + 과정별(IB/AP) 비교 ── */
function CostStructureSection({ school, color }: { school: HighSchoolDetail; color: string }) {
  const cost = school.costStructure;
  const groups = cost?.groups ?? [];
  // 실제로 돈이 나가는 그룹을 기본으로 펼쳐 둔다 (없으면 첫 그룹)
  const defaultGroup = groups.find((g) => g.id === 'pay')?.id ?? groups[0]?.id ?? null;
  const [openGroup, setOpenGroup] = useState<string | null>(defaultGroup);
  if (!cost) return null;

  return (
    <SectionShell emoji="💰" title="등록금 구조 한눈에 보기" subtitle={cost.asOf} color={color}>
      {/* 헤드라인 + 총액 */}
      <div className="rounded-xl p-2.5 mb-2" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
        <p className="text-sm text-gray-100 leading-relaxed"><HL text={cost.headline} /></p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[11px] text-gray-400">공시 1인당 연 학비</span>
          <span className="text-lg font-bold" style={{ color }}>{cost.totalPerYear}</span>
        </div>
        {cost.totalNote && <p className="text-[11px] text-gray-400 mt-1 leading-relaxed"><HL text={cost.totalNote} /></p>}
      </div>

      {(cost.quickTiles ?? []).length > 0 && <CostQuickTiles tiles={cost.quickTiles!} color={color} />}

      {cost.periodTable && cost.periodTable.rows.length > 0 && (
        <div className="mb-2">
          <CostPeriodTable table={cost.periodTable} color={color} />
        </div>
      )}

      {cost.actualPayNote && (
        <div className="rounded-xl p-2.5 mb-2" style={{ background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.30)' }}>
          <p className="text-[11px] font-bold text-red-300 mb-0.5">🚨 실납부 기준</p>
          <p className="text-sm text-gray-100 leading-relaxed"><HL text={cost.actualPayNote} /></p>
        </div>
      )}

      {/* 그룹 트리 */}
      <div className="space-y-1.5">
        {groups.map((g) => {
          const open = openGroup === g.id;
          const gTone = toneOf(g.id);
          const gColor = gTone?.color ?? color;
          return (
            <div
              key={g.id}
              className="rounded-xl overflow-hidden"
              style={{ background: gTone?.bg ?? 'rgba(255,255,255,0.04)', border: `1px solid ${gTone?.border ?? 'rgba(255,255,255,0.08)'}` }}
            >
              <button
                type="button"
                onClick={() => setOpenGroup(open ? null : g.id)}
                className="w-full flex items-start gap-2 p-2.5 text-left transition-colors hover:bg-white/5"
              >
                <ChevronRight
                  className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition-transform"
                  style={{ color: gColor, transform: open ? 'rotate(90deg)' : 'none' }}
                />
                <span className="flex-1 min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-gray-100">{g.emoji} {g.label}</span>
                    <span className="text-sm font-bold flex-shrink-0" style={{ color: gColor }}>{g.amount}</span>
                  </span>
                  {g.note && <span className="block text-[11px] text-gray-400 mt-0.5 leading-relaxed"><HL text={g.note} /></span>}
                </span>
              </button>
              {open && (
                <ul className="px-2.5 pb-2.5 pl-7 space-y-1">
                  {g.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-gray-600 mt-0.5">└</span>
                      <span className="flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-gray-200">{it.label}</span>
                          <span className="font-semibold text-gray-300 flex-shrink-0">{it.amount}</span>
                        </span>
                        {it.note && <span className="block text-[11px] text-gray-500 leading-relaxed"><HL text={it.note} /></span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* 과정별(IB/AP/기숙) 비교 */}
      {(cost.programTracks ?? []).length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] font-bold text-gray-400 mb-1.5">🎓 과정·트랙별로 얼마나 달라지나요?</p>
          <div className="space-y-1.5">
            {(cost.programTracks ?? []).map((t, i) => (
              <div key={i} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}20` }}>
                <p className="text-sm font-semibold text-gray-100 mb-1.5">{t.emoji ?? '•'} {t.track}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <p className="text-[10px] text-gray-500">등록금</p>
                    <p className="text-xs font-semibold text-gray-200 leading-snug">{t.tuition}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">추가 비용</p>
                    <p className="text-xs font-semibold text-gray-200 leading-snug">{t.extra}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">연 부담 합계</p>
                    <p className="text-xs font-semibold leading-snug" style={{ color }}>{t.yearTotal}</p>
                  </div>
                </div>
                {t.note && <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed"><HL text={t.note} /></p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주의 사항 */}
      {(cost.notes ?? []).length > 0 && (
        <ul className="mt-2.5 space-y-1">
          {(cost.notes ?? []).map((n, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-300 leading-relaxed">
              <span className="flex-shrink-0 mt-0.5" style={{ color }}>▸</span>
              <span><HL text={n} /></span>
            </li>
          ))}
        </ul>
      )}
      <SourceList sources={cost.sources} color={color} />
    </SectionShell>
  );
}

/** ── 2. 모집인원·경쟁률 ── */
function AdmissionFactsSection({ school, color }: { school: HighSchoolDetail; color: string }) {
  const f = school.admissionFacts;
  if (!f) return null;
  return (
    <SectionShell emoji="📊" title={`${f.year} 모집인원·경쟁률`} subtitle={f.categoryAverage} color={color}>
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] text-gray-500">모집인원</p>
          <p className="text-base font-bold text-gray-100">{f.capacityTotal}명</p>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] text-gray-500">지원자</p>
          <p className="text-base font-bold text-gray-100">{f.applicantsTotal ? `${f.applicantsTotal}명` : '—'}</p>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
          <p className="text-[10px] text-gray-500">경쟁률</p>
          <p className="text-base font-bold" style={{ color }}>{f.overallRate}</p>
        </div>
      </div>

      {(f.prevYearRate || f.trend) && (
        <p className="text-xs text-gray-300 mb-2">
          전년 {f.prevYearRate ?? '—'} → 올해 {f.overallRate}
          {f.trend && <span className="ml-1 font-semibold" style={{ color }}>· {f.trend}</span>}
        </p>
      )}

      <div className="space-y-1">
        {f.tracks.map((t, i) => (
          <div key={i} className="rounded-lg px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-gray-200">└ {t.name}</span>
              <span className="text-xs text-gray-300 flex-shrink-0">
                {t.capacity ? `${t.capacity}명` : ''}
                {t.applicants ? ` / ${t.applicants}명` : ''}
                {t.rate ? <span className="ml-1 font-bold" style={{ color }}>{t.rate}</span> : null}
              </span>
            </div>
            {t.note && <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed"><HL text={t.note} /></p>}
          </div>
        ))}
      </div>

      {f.note && (
        <div className="mt-2 p-2.5 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <p className="text-xs text-gray-100 leading-relaxed"><HL text={f.note} /></p>
        </div>
      )}
      <SourceList sources={f.sources} color={color} />
    </SectionShell>
  );
}

/** ── 3. 대학 진학 추이 ── */
function UniversityOutcomesSection({ school, color }: { school: HighSchoolDetail; color: string }) {
  const o = school.universityOutcomes;
  if (!o) return null;
  return (
    <SectionShell emoji="🎓" title={o.title ?? '대학 진학 추이 (SKY·서울권·해외대)'} color={color}>
      <p className="text-sm text-gray-100 leading-relaxed mb-2"><HL text={o.headline} /></p>

      {o.snuByYear && o.snuByYear.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {o.snuByYear.map((r, i) => (
            <div key={i} className="rounded-xl px-2.5 py-1.5" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
              <p className="text-[10px] text-gray-400">{r.year} {o.metricLabel ?? '서울대'}</p>
              <p className="text-sm font-bold" style={{ color }}>{r.count}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        {(o.extraRows ?? []).map((r, i) => (
          <p key={i} className="text-xs text-gray-300 leading-relaxed">
            {r.emoji} <span className="text-gray-400">{r.label} · </span><HL text={r.value} />
          </p>
        ))}
        {o.overseas && (
          <p className="text-xs text-gray-300 leading-relaxed">✈️ <span className="text-gray-400">{o.overseasLabel ?? '해외대'} · </span><HL text={o.overseas} /></p>
        )}
        {o.seoulAreaNote && (
          <p className="text-xs text-gray-300 leading-relaxed">🏙️ <span className="text-gray-400">{o.seoulAreaLabel ?? '서울권'} · </span><HL text={o.seoulAreaNote} /></p>
        )}
        {o.dataConfidence && (
          <p className="text-[11px] text-gray-500 leading-relaxed">⚠️ {o.dataConfidence}</p>
        )}
      </div>
      <SourceList sources={o.sources} color={color} />
    </SectionShell>
  );
}

/** ── 4. 지역 연계 ── */
function RegionalLinkageSection({ school, color }: { school: HighSchoolDetail; color: string }) {
  const r = school.regionalLinkage;
  if (!r) return null;
  const rows: { emoji: string; label: string; value?: string }[] = [
    { emoji: '🗺️', label: '선발 범위', value: r.selectionScope },
    { emoji: '🎯', label: '지역 트랙', value: r.regionTrack },
    { emoji: '🔗', label: '지역 자원 연결', value: r.localTie },
    { emoji: '🚌', label: '통학·기숙', value: r.commute },
  ].filter((x) => !!x.value);

  return (
    <SectionShell emoji="🗺️" title="지역 연계·선발 범위" color={color}>
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] text-gray-500 mb-0.5">{row.emoji} {row.label}</p>
            <p className="text-xs text-gray-200 leading-relaxed"><HL text={row.value!} /></p>
          </div>
        ))}
      </div>
      <SourceList sources={r.sources} color={color} />
    </SectionShell>
  );
}

/**
 * 학교 상세 — 비용/입시/진학/지역 검증 데이터 섹션 묶음
 */
export function SchoolCostOutcomeSections({ school, color }: { school: HighSchoolDetail; color: string }) {
  if (!school.costStructure && !school.admissionFacts && !school.universityOutcomes && !school.regionalLinkage) {
    return null;
  }
  return (
    <>
      <CostStructureSection school={school} color={color} />
      <AdmissionFactsSection school={school} color={color} />
      <UniversityOutcomesSection school={school} color={color} />
      <RegionalLinkageSection school={school} color={color} />
    </>
  );
}
