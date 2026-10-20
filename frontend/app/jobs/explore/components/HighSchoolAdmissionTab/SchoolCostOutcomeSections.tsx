'use client';

import { ExternalLink } from 'lucide-react';
import type { HighSchoolDetail, SchoolSourceLink } from '../../types';
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

/** 수업료가 0원(무상)인지 — totalPerYear 문구로 판단. 금액이 안 보이면 null(학교 확인) */
function tuitionFreeOf(total: string): boolean | null {
  if (/무상|(^|[^\d,.])0원/.test(total)) return true;
  if (/\d[\d,.~]*\s*만\s*원/.test(total)) return false;
  return null;
}

/** ── 1. 등록금 — 무상 여부 + 연 등록금만. 나머지 비용은 학교에서 직접 확인 ── */
function CostStructureSection({ school, color }: { school: HighSchoolDetail; color: string }) {
  const cost = school.costStructure;
  if (!cost) return null;
  const free = tuitionFreeOf(cost.totalPerYear);
  const badge =
    free === true
      ? { text: '무상 교육', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)' }
      : free === false
        ? { text: '등록금 있음', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' }
        : null;

  return (
    <SectionShell emoji="💰" title="등록금" subtitle={cost.asOf} color={color}>
      <div className="rounded-xl p-2.5 flex items-center justify-between gap-3 flex-wrap" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
        <div className="min-w-0">
          <p className="text-[11px] text-gray-400">연 등록금</p>
          <p className="text-lg font-bold leading-snug" style={{ color }}><HL text={cost.totalPerYear} /></p>
        </div>
        {badge && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
          >
            {badge.text}
          </span>
        )}
      </div>
      <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
        💡 기숙사비·급식비·교복·실습비 같은 그 외 비용은 학교마다 달라요. 입학요강이나 학교에 직접 확인해 보세요.
      </p>
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
          <p className="text-[11px] text-gray-500 leading-relaxed">⚠️ <HL text={o.dataConfidence} /></p>
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
