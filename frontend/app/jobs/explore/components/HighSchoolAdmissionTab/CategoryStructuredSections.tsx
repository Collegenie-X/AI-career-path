'use client';

import { useState } from 'react';
import { GlossaryText } from '@/components/shared/GlossaryText';
import type {
  HighSchoolDescriptionOutline,
  HighSchoolDifferentiators,
  HighSchoolFitLevel,
  HighSchoolInterestFitGuide,
  HighSchoolStrategyTree,
  HighSchoolTuitionStructure,
  HighSchoolGroupTree,
  HighSchoolDetail,
  HighSchoolFeatureFocus,
  HighSchoolVerifySource,
  SchoolAdmissionFactsComparison,
  SchoolCostComparison,
  SchoolSourceLink,
} from '../../types';

/** ==형광펜== + 입시 약어 툴팁 렌더 */
function HL({ text }: { text: string }) {
  return <GlossaryText>{text}</GlossaryText>;
}

/** 트리 leaf 한 줄 — 왼쪽 세로선 + ㄴ자 연결선 */
function TreeLeaf({ text, color, last }: { text: string; color: string; last: boolean }) {
  return (
    <li className="relative pl-5 pb-2 last:pb-0">
      {/* 세로 연결선 (마지막 항목은 ㄴ자 높이까지만) */}
      <span
        className="absolute left-0 top-0"
        style={{
          width: 1,
          height: last ? 11 : '100%',
          background: `${color}55`,
        }}
      />
      {/* 가로 연결선 */}
      <span className="absolute left-0 top-[10px]" style={{ width: 12, height: 1, background: `${color}55` }} />
      <span className="text-[13px] text-gray-100 leading-relaxed">
        <HL text={text} />
      </span>
    </li>
  );
}

function SectionTitle({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color }}>
      {children}
    </p>
  );
}

// ── 1. 설명 개요 트리 ─────────────────────────────────────────

export function DescriptionOutlineTree({
  outline,
  color,
  bgColor,
  title = '🌳 이 유형 한눈에 보기',
}: {
  outline: HighSchoolDescriptionOutline;
  color: string;
  bgColor: string;
  title?: string;
}) {
  return (
    <div>
      <SectionTitle color={color}>{title}</SectionTitle>

      {/* 중심 문장 */}
      <div
        className="rounded-2xl px-4 py-3 mb-3"
        style={{
          background: `linear-gradient(135deg, ${color}2a 0%, rgba(0,0,0,0.25) 100%)`,
          border: `1.5px solid ${color}55`,
        }}
      >
        <p className="text-[11px] font-bold mb-1 tracking-wider" style={{ color }}>
          핵심 요약
        </p>
        <p className="text-sm font-bold text-white leading-relaxed">
          <HL text={outline.coreSentence} />
        </p>
      </div>

      {/* 그룹 트리 */}
      <div className="space-y-2">
        {outline.groups.map((group) => (
          <div
            key={group.label}
            className="rounded-2xl p-3.5"
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${color}33`,
            }}
          >
            <p className="text-[13px] font-bold mb-2 flex items-center gap-1.5" style={{ color }}>
              <span className="text-base">{group.emoji}</span>
              {group.label}
            </p>
            <ul className="ml-1">
              {group.points.map((point, index) => (
                <TreeLeaf key={point} text={point} color={color} last={index === group.points.length - 1} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 2. 관심 분야 적합도 ───────────────────────────────────────

const FIT_LEVEL_STYLE: Record<HighSchoolFitLevel, { label: string; emoji: string; color: string; bg: string }> = {
  best: { label: '최적', emoji: '🟢', color: '#4ade80', bg: 'rgba(74,222,128,0.14)' },
  good: { label: '가능', emoji: '🔵', color: '#60a5fa', bg: 'rgba(96,165,250,0.14)' },
  caution: { label: '조건부', emoji: '🟡', color: '#fbbf24', bg: 'rgba(251,191,36,0.14)' },
  avoid: { label: '비추천', emoji: '🔴', color: '#f87171', bg: 'rgba(248,113,113,0.14)' },
};

export function InterestFitSection({
  guide,
  color,
  bgColor,
}: {
  guide: HighSchoolInterestFitGuide;
  color: string;
  bgColor: string;
}) {
  const [openField, setOpenField] = useState<string | null>(guide.fits[0]?.field ?? null);

  return (
    <div>
      <SectionTitle color={color}>🎯 내 관심 분야, 여기 가도 될까?</SectionTitle>

      {/* 중심 문장 + 확장 설명 */}
      <div
        className="rounded-2xl px-4 py-3 mb-3"
        style={{
          background: `linear-gradient(135deg, ${color}2a 0%, rgba(0,0,0,0.25) 100%)`,
          border: `1.5px solid ${color}55`,
        }}
      >
        <p className="text-sm font-bold text-white leading-relaxed">
          <HL text={guide.headline} />
        </p>
        {guide.subline && (
          <p className="text-[13px] text-gray-300 leading-relaxed mt-2 pt-2" style={{ borderTop: `1px dashed ${color}40` }}>
            <HL text={guide.subline} />
          </p>
        )}
      </div>

      {/* 분야별 판정 — 탭하면 확장 설명 */}
      <div className="space-y-2">
        {guide.fits.map((fit) => {
          const style = FIT_LEVEL_STYLE[fit.level];
          const isOpen = openField === fit.field;
          return (
            <button
              key={fit.field}
              type="button"
              onClick={() => setOpenField(isOpen ? null : fit.field)}
              className="w-full text-left rounded-2xl p-3.5 transition-all active:scale-[0.99]"
              style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
                border: `1px solid ${isOpen ? style.color + '66' : color + '2a'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg flex-shrink-0">{fit.emoji}</span>
                <span className="text-[13px] font-bold text-white flex-1 min-w-0">{fit.field}</span>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: style.bg, color: style.color }}
                >
                  {style.emoji} {style.label}
                </span>
              </div>
              {isOpen && (
                <div className="mt-2.5 space-y-2">
                  <p className="text-[13px] text-gray-100 leading-relaxed">
                    <HL text={fit.reason} />
                  </p>
                  {fit.route && (
                    <p className="text-[12px] leading-relaxed rounded-xl px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.05)', color: '#d1d5db' }}>
                      <span className="font-bold" style={{ color: style.color }}>경로 </span>
                      <HL text={fit.route} />
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 계열별 판정 */}
      {guide.trackVerdict && guide.trackVerdict.length > 0 && (
        <div className="mt-3 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}2a` }}>
          <p className="text-[12px] font-bold mb-2" style={{ color }}>
            🧭 계열·트랙별 판정
          </p>
          <ul className="ml-1">
            {guide.trackVerdict.map((verdict, index) => (
              <TreeLeaf
                key={verdict.label}
                text={`**${verdict.emoji ?? ''} ${verdict.label}** — ${verdict.detail}`.replace(/\*\*(.+?)\*\*/g, '==$1==')}
                color={color}
                last={index === guide.trackVerdict!.length - 1}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── 3. 차별화 포인트 ──────────────────────────────────────────

export function DifferentiatorSection({
  differentiators,
  color,
  bgColor,
}: {
  differentiators: HighSchoolDifferentiators;
  color: string;
  bgColor: string;
}) {
  return (
    <div>
      <SectionTitle color={color}>🔍 이 유형만의 차별점</SectionTitle>

      <div
        className="rounded-2xl px-4 py-3 mb-3"
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, rgba(0,0,0,0.25) 100%)`,
          border: `1.5px solid ${color}4a`,
        }}
      >
        <p className="text-sm font-bold text-white leading-relaxed">
          <HL text={differentiators.coreSentence} />
        </p>
      </div>

      <div className="space-y-2">
        {differentiators.items.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl p-3.5"
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${color}33`,
            }}
          >
            <p className="text-[12px] font-bold mb-1.5 flex items-center gap-1.5" style={{ color }}>
              <span className="text-base">{item.emoji}</span>
              {item.label}
            </p>
            {/* 중심 문장 — 굵게 */}
            <p className="text-[13px] font-bold text-white leading-relaxed">
              <HL text={item.headline} />
            </p>
            {/* 확장 설명 — 구분선 아래 */}
            <p
              className="text-[13px] text-gray-300 leading-relaxed mt-2 pt-2"
              style={{ borderTop: `1px dashed ${color}33` }}
            >
              <HL text={item.detail} />
            </p>
            {item.compare && (
              <p
                className="text-[12px] leading-relaxed mt-2 rounded-xl px-2.5 py-2"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#d1d5db' }}
              >
                <span className="font-bold" style={{ color }}>비교 </span>
                <HL text={item.compare} />
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 4. 내신 전략·공부 스타일 트리 ─────────────────────────────

export function StrategyTreeSection({
  tree,
  color,
  bgColor,
  fixedMode,
  title = '📅 내신 전략 · 공부 스타일 트리',
}: {
  tree: HighSchoolStrategyTree;
  color: string;
  bgColor: string;
  /** 'grade' | 'field'로 고정하면 전환 탭이 숨겨집니다 */
  fixedMode?: 'grade' | 'field';
  title?: string;
}) {
  const [selectedMode, setMode] = useState<'grade' | 'field'>(fixedMode ?? 'grade');
  const mode = fixedMode ?? selectedMode;

  return (
    <div>
      {title ? <SectionTitle color={color}>{title}</SectionTitle> : null}

      {/* 보기 전환 */}
      {!fixedMode && (
      <div className="flex gap-1 rounded-xl p-1 mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {([
          { id: 'grade' as const, label: '🗓️ 학년별' },
          { id: 'field' as const, label: '🧩 분야별' },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id)}
            className="flex-1 py-2 rounded-lg text-[13px] font-bold transition-all"
            style={{
              background: mode === tab.id ? `${color}40` : 'transparent',
              color: mode === tab.id ? '#ffffff' : '#9ca3af',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      )}

      {mode === 'grade' ? (
        <div className="space-y-2">
          {tree.byGrade.map((stage) => (
            <div
              key={stage.stage}
              className="rounded-2xl p-3.5"
              style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
                border: `1px solid ${color}33`,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-[12px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${color}28`, color }}
                >
                  {stage.emoji ?? '📍'} {stage.stage}
                </span>
                <span className="text-[13px] font-bold text-white leading-snug">
                  <HL text={stage.goal} />
                </span>
              </div>
              <div className="space-y-2 mt-2.5">
                {stage.nodes.map((node) => (
                  <div key={node.label}>
                    <p className="text-[12px] font-bold text-gray-300 mb-1">
                      {node.emoji ?? '•'} {node.label}
                    </p>
                    <ul className="ml-1">
                      {node.items.map((item, index) => (
                        <TreeLeaf key={item} text={item} color={color} last={index === node.items.length - 1} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tree.byField.map((field) => (
            <div
              key={field.area}
              className="rounded-2xl p-3.5"
              style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
                border: `1px solid ${color}33`,
              }}
            >
              <p className="text-[13px] font-bold mb-1 flex items-center gap-1.5" style={{ color }}>
                <span className="text-base">{field.emoji ?? '🧩'}</span>
                {field.area}
              </p>
              <p className="text-[13px] text-gray-100 leading-relaxed mb-2">
                <HL text={field.summary} />
              </p>
              <ul className="ml-1">
                {field.items.map((item, index) => (
                  <TreeLeaf key={item} text={item} color={color} last={index === field.items.length - 1} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 5. 유형 내 학교 비교표 (등록금 / 경쟁률) ────────────────────

function ComparisonSourceRow({ sources, color }: { sources?: SchoolSourceLink[]; color: string }) {
  if (!sources?.length) return null;
  return (
    <div className="mt-2 pt-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: `${color}22` }}>
      <span className="text-[11px] text-gray-500">🔎 출처</span>
      {sources.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] px-1.5 py-0.5 rounded-md hover:opacity-80"
          style={{ background: `${color}15`, color }}
        >
          {s.label} ↗
        </a>
      ))}
    </div>
  );
}

/** 학교별 등록금 비교표 + 경쟁률 비교표 (접이식) */
export function CategoryComparisonTables({
  cost,
  facts,
  color,
  bgColor,
}: {
  cost?: SchoolCostComparison;
  facts?: SchoolAdmissionFactsComparison;
  color: string;
  bgColor: string;
}) {
  const [open, setOpen] = useState<'cost' | 'facts' | null>('cost');
  if (!cost && !facts) return null;

  const cardStyle = {
    background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
    border: `1px solid ${color}33`,
  };

  return (
    <div className="space-y-2">
      <SectionTitle color={color}>📋 학교별 비교표 (웹 검증 데이터)</SectionTitle>

      {cost && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <button
            type="button"
            onClick={() => setOpen(open === 'cost' ? null : 'cost')}
            className="w-full px-3.5 py-3 text-left"
          >
            <p className="text-[13px] font-bold" style={{ color }}>
              💰 {cost.title} <span className="text-gray-500 font-normal">{open === 'cost' ? '▲' : '▼'}</span>
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">{cost.asOf}</p>
          </button>
          {open === 'cost' && (
            <div className="px-3.5 pb-3.5">
              <p className="text-[13px] text-gray-100 leading-relaxed mb-2.5">
                <HL text={cost.keyInsight} />
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border-collapse min-w-[440px]">
                  <thead>
                    <tr style={{ color }}>
                      <th className="text-left py-1.5 pr-2 font-bold">학교</th>
                      <th className="text-left py-1.5 pr-2 font-bold">설립</th>
                      <th className="text-right py-1.5 pr-2 font-bold">등록금</th>
                      <th className="text-right py-1.5 pr-2 font-bold">수익자부담</th>
                      <th className="text-right py-1.5 font-bold">연 합계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cost.rows.map((r) => (
                      <tr key={r.school} className="border-t" style={{ borderColor: `${color}20` }}>
                        <td className="py-1.5 pr-2 text-gray-100 font-semibold whitespace-nowrap"><HL text={r.school} /></td>
                        <td className="py-1.5 pr-2 text-gray-400 whitespace-nowrap"><HL text={r.type} /></td>
                        <td className="py-1.5 pr-2 text-right text-gray-200 whitespace-nowrap"><HL text={r.tuition} /></td>
                        <td className="py-1.5 pr-2 text-right text-gray-200 whitespace-nowrap"><HL text={r.beneficiary} /></td>
                        <td className="py-1.5 text-right font-semibold" style={{ color }}>
                          <HL text={r.total} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="mt-2 space-y-1">
                {cost.rows
                  .filter((r) => r.program || r.feature)
                  .map((r) => (
                    <li key={`p-${r.school}`} className="text-[11px] text-gray-400 leading-relaxed">
                      <span className="text-gray-300 font-semibold">{r.school}</span>
                      {r.program && <> · <HL text={r.program} /></>}
                      {r.feature && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] whitespace-nowrap" style={{ background: `${color}18`, color }}>
                          {r.feature}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
              {cost.cautions?.length ? (
                <ul className="mt-2 space-y-1">
                  {cost.cautions.map((c) => (
                    <li key={c} className="text-[12px] text-gray-300 leading-relaxed flex gap-1.5">
                      <span style={{ color }}>▸</span>
                      <span><HL text={c} /></span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ComparisonSourceRow sources={cost.sources} color={color} />
            </div>
          )}
        </div>
      )}

      {facts && (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <button
            type="button"
            onClick={() => setOpen(open === 'facts' ? null : 'facts')}
            className="w-full px-3.5 py-3 text-left"
          >
            <p className="text-[13px] font-bold" style={{ color }}>
              📊 {facts.title} <span className="text-gray-500 font-normal">{open === 'facts' ? '▲' : '▼'}</span>
            </p>
          </button>
          {open === 'facts' && (
            <div className="px-3.5 pb-3.5">
              <p className="text-[13px] text-gray-100 leading-relaxed mb-2.5">
                <HL text={facts.summary} />
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border-collapse min-w-[420px]">
                  <thead>
                    <tr style={{ color }}>
                      <th className="text-left py-1.5 pr-2 font-bold">학교</th>
                      <th className="text-right py-1.5 pr-2 font-bold">모집</th>
                      <th className="text-right py-1.5 pr-2 font-bold">지원</th>
                      <th className="text-right py-1.5 pr-2 font-bold">경쟁률</th>
                      <th className="text-right py-1.5 font-bold">전년 대비</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facts.rows.map((r) => (
                      <tr key={r.school} className="border-t" style={{ borderColor: `${color}20` }}>
                        <td className="py-1.5 pr-2 text-gray-100 font-semibold whitespace-nowrap"><HL text={r.school} /></td>
                        <td className="py-1.5 pr-2 text-right text-gray-200">{r.capacity}명</td>
                        <td className="py-1.5 pr-2 text-right text-gray-200">{r.applicants ? `${r.applicants}명` : '—'}</td>
                        <td className="py-1.5 pr-2 text-right font-semibold" style={{ color }}>{r.rate}</td>
                        <td className="py-1.5 text-right text-gray-400 whitespace-nowrap">
                          {r.prev ? `${r.prev} ` : ''}{r.trend ?? ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {facts.insights?.length ? (
                <ul className="mt-2 space-y-1">
                  {facts.insights.map((c) => (
                    <li key={c} className="text-[12px] text-gray-300 leading-relaxed flex gap-1.5">
                      <span style={{ color }}>▸</span>
                      <span><HL text={c} /></span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ComparisonSourceRow sources={facts.sources} color={color} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── 5. 등록금 구조 트리 ────────────────────────────────────────

const TUITION_BADGE: Record<'free' | 'paid' | 'supported', { label: string; color: string; bg: string }> = {
  free: { label: '국가 지원 · 0원', color: '#4ade80', bg: 'rgba(74,222,128,0.14)' },
  paid: { label: '학부모 부담', color: '#fbbf24', bg: 'rgba(251,191,36,0.14)' },
  supported: { label: '사업비 · 학생 부담 없음', color: '#60a5fa', bg: 'rgba(96,165,250,0.14)' },
};

export function TuitionStructureTree({
  structure,
  color,
  bgColor,
}: {
  structure: HighSchoolTuitionStructure;
  color: string;
  bgColor: string;
}) {
  const [openLevel, setOpenLevel] = useState<number | null>(structure.layers[0]?.level ?? null);

  return (
    <div>
      <SectionTitle color={color}>💰 등록금 구조 — 어디까지 0원인가</SectionTitle>

      <div
        className="rounded-2xl px-4 py-3 mb-3"
        style={{
          background: `linear-gradient(135deg, ${color}2a 0%, rgba(0,0,0,0.25) 100%)`,
          border: `1.5px solid ${color}55`,
        }}
      >
        <p className="text-sm font-bold text-white leading-relaxed">
          <HL text={structure.coreSentence} />
        </p>
        {structure.howToRead && (
          <p
            className="text-[12px] text-gray-300 leading-relaxed mt-2 pt-2"
            style={{ borderTop: `1px dashed ${color}40` }}
          >
            <HL text={structure.howToRead} />
          </p>
        )}
      </div>

      {/* 3계층 트리 */}
      <div className="space-y-2">
        {structure.layers.map((layer) => {
          const badge = TUITION_BADGE[layer.badge];
          const isOpen = openLevel === layer.level;
          return (
            <button
              key={layer.level}
              type="button"
              onClick={() => setOpenLevel(isOpen ? null : layer.level)}
              className="w-full text-left rounded-2xl p-3.5 transition-all active:scale-[0.99]"
              style={{
                background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
                border: `1px solid ${isOpen ? badge.color + '66' : color + '2a'}`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg flex-shrink-0">{layer.emoji}</span>
                <span className="text-[13px] font-bold text-white flex-1 min-w-0">{layer.label}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              </div>
              <p className="text-[12px] font-bold mt-1.5" style={{ color: badge.color }}>
                {layer.amount}
              </p>
              <p className="text-[13px] text-gray-200 leading-relaxed mt-1">
                <HL text={layer.summary} />
              </p>

              {isOpen && (
                <div className="mt-2.5">
                  <ul className="ml-1">
                    {layer.items.map((item, index) => (
                      <TreeLeaf
                        key={item.name}
                        text={`==${item.name}== · ${item.cost}${item.note ? ` — ${item.note}` : ''}`}
                        color={badge.color}
                        last={index === layer.items.length - 1}
                      />
                    ))}
                  </ul>
                  {layer.compare && (
                    <p
                      className="text-[12px] leading-relaxed mt-2 rounded-xl px-2.5 py-2"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#d1d5db' }}
                    >
                      <span className="font-bold" style={{ color }}>비교 </span>
                      <HL text={layer.compare} />
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* IB 비용 구분 */}
      {structure.ibNote && (
        <div
          className="mt-3 rounded-2xl p-3.5"
          style={{
            background: 'linear-gradient(135deg, rgba(167,139,250,0.14) 0%, rgba(0,0,0,0.25) 100%)',
            border: '1px solid rgba(167,139,250,0.4)',
          }}
        >
          <p className="text-[12px] font-bold mb-2" style={{ color: '#c4b5fd' }}>
            {structure.ibNote.title ?? '🎓 IB 비용은 등록금과 별개입니다'}
          </p>
          <p className="text-[13px] font-bold text-white leading-relaxed mb-2">
            <HL text={structure.ibNote.headline} />
          </p>
          <ul className="ml-1">
            {structure.ibNote.points.map((point, index) => (
              <TreeLeaf
                key={point}
                text={point}
                color="#a78bfa"
                last={index === structure.ibNote!.points.length - 1}
              />
            ))}
          </ul>
          {structure.ibNote.verdict && (
            <p
              className="text-[12px] leading-relaxed mt-2 rounded-xl px-2.5 py-2 text-gray-200"
              style={{ background: 'rgba(167,139,250,0.12)' }}
            >
              <HL text={structure.ibNote.verdict} />
            </p>
          )}
          {structure.ibNote.sources && structure.ibNote.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t flex flex-wrap gap-1.5" style={{ borderColor: 'rgba(167,139,250,0.25)' }}>
              <span className="text-[11px] text-gray-500">🔎 출처</span>
              {structure.ibNote.sources.map((src) => (
                <a
                  key={src.url + src.label}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] px-1.5 py-0.5 rounded-md hover:opacity-80"
                  style={{ background: 'rgba(167,139,250,0.15)', color: '#c4b5fd' }}
                >
                  {src.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 유형별 비용 비교 */}
      {structure.comparison && structure.comparison.length > 0 && (
        <div className="mt-3 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}2a` }}>
          <p className="text-[12px] font-bold mb-2" style={{ color }}>
            🆚 고교 유형별 연간 비용 비교
          </p>
          <div className="space-y-1.5">
            {structure.comparison.map((row) => (
              <div
                key={row.type}
                className="rounded-xl px-2.5 py-2"
                style={{
                  background: row.highlight ? `${color}20` : 'rgba(255,255,255,0.04)',
                  border: row.highlight ? `1px solid ${color}55` : '1px solid transparent',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{row.emoji}</span>
                  <span className="text-[12px] font-bold text-white flex-1 min-w-0">{row.type}</span>
                  <span className="text-[12px] font-bold flex-shrink-0" style={{ color: row.highlight ? color : '#d1d5db' }}>
                    {row.annual}
                  </span>
                </div>
                {row.note && <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{row.note}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 확인 체크리스트 */}
      {structure.checklist && structure.checklist.length > 0 && (
        <div className="mt-3 rounded-2xl p-3.5" style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <p className="text-[12px] font-bold mb-2" style={{ color: '#fbbf24' }}>
            ✅ 지원 전 직접 확인할 것
          </p>
          <ul className="ml-1">
            {structure.checklist.map((item, index) => (
              <TreeLeaf key={item} text={item} color="#fbbf24" last={index === structure.checklist!.length - 1} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── 6. 학교 그룹핑 트리 ────────────────────────────────────────

/** "축 1 · 시도별 — 우리 동네에 있는가" → "시도별" */
function axisTabLabel(label: string) {
  const afterAxis = label.includes('·') ? label.slice(label.indexOf('·') + 1) : label;
  return afterAxis.split('—')[0].trim() || label;
}

export function SchoolGroupTreeSection({
  tree,
  color,
  bgColor,
}: {
  tree: HighSchoolGroupTree;
  color: string;
  bgColor: string;
}) {
  const [axisId, setAxisId] = useState<string>(tree.axes[0]?.id ?? '');
  const axis = tree.axes.find((a) => a.id === axisId) ?? tree.axes[0];

  return (
    <div>
      <SectionTitle color={color}>🌳 학교 그룹핑 — 같은 자공고가 아니다</SectionTitle>

      <div
        className="rounded-2xl px-4 py-3 mb-3"
        style={{
          background: `linear-gradient(135deg, ${color}2a 0%, rgba(0,0,0,0.25) 100%)`,
          border: `1.5px solid ${color}55`,
        }}
      >
        <p className="text-sm font-bold text-white leading-relaxed">
          <HL text={tree.coreSentence} />
        </p>
        {tree.scopeNote && (
          <p className="text-[12px] text-gray-300 leading-relaxed mt-2 pt-2" style={{ borderTop: `1px dashed ${color}40` }}>
            <HL text={tree.scopeNote} />
          </p>
        )}
      </div>

      {/* 전국 시·도별 지정 현황 */}
      {tree.nationalStatus && (
        <div className="rounded-2xl p-3.5 mb-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}2a` }}>
          <div className="flex items-baseline gap-2 mb-1.5">
            <p className="text-[12px] font-bold" style={{ color }}>🇰🇷 전국 시·도별 지정 현황</p>
            <span className="text-[13px] font-bold text-white">{tree.nationalStatus.total}</span>
          </div>
          <p className="text-[13px] text-gray-200 leading-relaxed mb-2">
            <HL text={tree.nationalStatus.headline} />
          </p>
          <div className="space-y-1">
            {tree.nationalStatus.rows.map((row) => {
              const max = Math.max(...tree.nationalStatus!.rows.map((r) => r.count));
              return (
                <div key={row.sido} className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-gray-200 w-10 flex-shrink-0">{row.sido}</span>
                  <span className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(row.count / max) * 100}%`, background: `linear-gradient(90deg, ${color}cc, ${color}66)` }}
                    />
                  </span>
                  <span className="text-[12px] font-bold w-10 text-right flex-shrink-0" style={{ color }}>{row.count}교</span>
                </div>
              );
            })}
          </div>
          {tree.nationalStatus.note && (
            <p className="text-[11px] text-gray-400 leading-relaxed mt-2">
              <HL text={tree.nationalStatus.note} />
            </p>
          )}
          <p className="text-[11px] text-gray-500 leading-relaxed mt-1">출처 · {tree.nationalStatus.asOf}</p>
        </div>
      )}

      {/* 축 전환 */}
      <div className="flex flex-wrap gap-1 rounded-xl p-1 mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {tree.axes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAxisId(item.id)}
            className="flex-1 min-w-[84px] py-2 rounded-lg text-[12px] font-bold transition-all"
            style={{
              background: axisId === item.id ? `${color}40` : 'transparent',
              color: axisId === item.id ? '#ffffff' : '#9ca3af',
            }}
          >
            {item.emoji} {axisTabLabel(item.label)}
          </button>
        ))}
      </div>

      {axis && (
        <div>
          {axis.description && (
            <p className="text-[12px] text-gray-300 leading-relaxed mb-2.5">
              <HL text={axis.description} />
            </p>
          )}
          <div className="space-y-2">
            {axis.groups.map((group) => (
              <div
                key={group.label}
                className="rounded-2xl p-3.5"
                style={{
                  background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
                  border: `1px solid ${color}33`,
                }}
              >
                <p className="text-[13px] font-bold mb-1 flex items-start gap-1.5" style={{ color }}>
                  <span className="text-base leading-none mt-0.5">{group.emoji}</span>
                  <span className="flex-1 min-w-0">{group.label}</span>
                  <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#9ca3af' }}>
                    {group.schools.length}교
                  </span>
                </p>
                {group.note && (
                  <p className="text-[12px] text-gray-300 leading-relaxed mb-2">
                    <HL text={group.note} />
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {group.schools.map((school) => (
                    <span
                      key={school.name}
                      className="text-[11px] rounded-lg px-2 py-1"
                      style={{ background: `${color}1f`, border: `1px solid ${color}33`, color: '#e5e7eb' }}
                    >
                      <span className="font-bold text-white">{school.name}</span>
                      {school.region && <span className="text-gray-400"> · {school.region.replace('경기 ', '')}</span>}
                      {school.tag && <span style={{ color }}> · {school.tag}</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tree.pickGuide && tree.pickGuide.length > 0 && (
        <div className="mt-3 rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}2a` }}>
          <p className="text-[12px] font-bold mb-2" style={{ color }}>
            🧭 이 트리로 학교 고르는 순서
          </p>
          <ul className="ml-1">
            {tree.pickGuide.map((step, index) => (
              <TreeLeaf key={step} text={step} color={color} last={index === tree.pickGuide!.length - 1} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── 9. 특색 지도 — AI 중점·과학중점·지역 연계(대학·기업) 자동 분류 ──────────

type FeatureBucket = {
  id: string;
  emoji: string;
  label: string;
  hint: string;
  match: RegExp;
  /** 태그 텍스트가 아니라 학교 필드로 직접 판정하는 축 (예: IB 인증) */
  pick?: (school: HighSchoolDetail) => boolean;
  /** match·pick으로 잡혔어도 이 패턴에 걸리면 제외 (예: 월드스쿨 축에서 후보학교 배제) */
  exclude?: RegExp;
  /** pick으로 잡힌 학교의 배지 문구 */
  note?: (school: HighSchoolDetail) => string | undefined;
  /** 이 축의 지정·인증 사실을 직접 확인할 수 있는 공식 사이트 */
  sources?: HighSchoolVerifySource[];
};

/** IB 학교 정보를 직접 확인할 수 있는 공식 창구 (인증 단계는 IBO, 후보·관심 단계는 교육청) */
const IB_SOURCES: HighSchoolVerifySource[] = [
  { label: 'IBO — Find an IB World School', url: 'https://www.ibo.org/programmes/find-an-ib-school/', what: '정식 인증(월드스쿨) 학교 공식 검색 — ==후보학교는 나오지 않습니다==' },
  { label: 'IBO — 한국 학교 안내 (Asia Pacific)', url: 'https://ibo.org/about-the-ib/the-ib-by-region/ib-asia-pacific/resources-for-schools-in-south-korea/', what: '국내 IB 운영 개요·학교 지원 자료' },
  { label: '대구교육청 IB 누리집', url: 'https://www.dge.go.kr/ib/index.do', what: '대구 월드스쿨·후보·관심학교 현황 — ==KB(한국형 바칼로레아) 추진 주체==' },
  { label: '제주교육청 — 국제바칼로레아(IB)', url: 'https://www.jje.go.kr/index.jje?menuCd=DOM_000000104000000000', what: '제주 IB 학교 현황 (표선고 등)' },
  { label: '서울교육청 — IB 학교 현황', url: 'https://www.sen.go.kr/www/eduinfo/ib/ib_3.jsp', what: '서울 단계별 명단 — ==고교는 2026.5.1 기준 관심학교 22교뿐==' },
  { label: '경기교육청 — IB 학교 현황', url: 'https://www.goe.go.kr/goe/na/ntt/selectNttInfo.do?nttSn=2326345&mi=10961', what: '경기 전체 명단(엑셀 첨부) — 학교급·공사립·단계까지' },
  { label: '전북교육청 — IB 학교 현황', url: 'https://www.jbe.go.kr/index.jbe?menuCd=DOM_000000105015000000', what: '전북 IB 학교 명단' },
  { label: '학교알리미', url: 'https://www.schoolinfo.go.kr/', what: '학급·학생 수, 졸업생 진로 현황, 학교회계 공시' },
];

const IB_VERIFY_NOTE = '학교 홍보 문구의 "IB"가 ==관심학교인지 · 후보학교인지 · 월드스쿨인지==부터 확인하세요. ==인증(월드스쿨)만 IBO 공식 검색에 나오고==, 후보·관심학교는 ==시·도교육청 현황 자료나 학교 홈페이지 공지==로만 확인됩니다.';

/** 확인처 / 무엇을 확인 — 사용자가 직접 열어볼 수 있는 공식 출처 표 */
export function VerifySourceTable({
  sources,
  note,
  color,
  bgColor,
  title = '🔎 어디서 확인하나 — 공식 확인처',
}: {
  sources?: HighSchoolVerifySource[];
  note?: string;
  color: string;
  bgColor: string;
  title?: string;
}) {
  if (!sources?.length) return null;
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
        border: `1px solid ${color}33`,
      }}
    >
      <div className="px-3.5 pt-3 pb-2">
        <p className="text-[13px] font-bold" style={{ color }}>{title}</p>
        {note && (
          <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
            <HL text={note} />
          </p>
        )}
      </div>
      <div className="px-2 pb-3 overflow-x-auto">
        <table className="w-full text-left" style={{ minWidth: 320 }}>
          <thead>
            <tr className="text-[10px] text-gray-500">
              <th className="px-1.5 py-1 font-semibold">확인처</th>
              <th className="px-1.5 py-1 font-semibold">무엇을 확인</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => (
              <tr key={s.url} className="align-top border-t" style={{ borderColor: `${color}1f` }}>
                <td className="px-1.5 py-2 whitespace-nowrap">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-semibold underline decoration-dotted underline-offset-2 hover:opacity-80"
                    style={{ color }}
                  >
                    {s.label} ↗
                  </a>
                </td>
                <td className="px-1.5 py-2 text-[11px] text-gray-300 leading-relaxed">
                  <HL text={s.what} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** 학교 태그·트랙 텍스트를 특색 카테고리로 묶는 규칙 */
const FEATURE_BUCKETS: FeatureBucket[] = [
  {
    id: 'ib-world',
    emoji: '🌐',
    label: 'IB 월드스쿨 (정식 인증 완료)',
    hint: 'IBO 최종 인증 — 이 학교에서 이수하면 IB 디플로마(성적표·졸업장)가 나옵니다',
    match: /IB\s*(DP|MYP|PYP|월드스쿨|인증|전\s*과정)|국제바칼로레아|디플로마/i,
    exclude: /후보|관심학교|추진\s*중|준비\s*중/,
    pick: (s) => s.ibCertified === true,
    note: (s) => (s.listTags ?? []).find((t) => /IB/i.test(t)) ?? 'IB DP 월드스쿨',
    sources: IB_SOURCES,
  },
  {
    id: 'ib-candidate',
    emoji: '⏳',
    label: 'IB 후보학교 (인증 심사 중)',
    hint: '관심학교 → 후보학교 → 월드스쿨 3단계 중 2단계. 아직 IB 디플로마는 나오지 않습니다',
    match: /IB[^·|]*후보|후보학교/i,
    note: (s) => (s.listTags ?? []).find((t) => /IB/i.test(t)) ?? 'IB 후보학교',
    sources: IB_SOURCES,
  },
  {
    id: 'hitech',
    emoji: '🏭',
    label: '하이텍고 (교명이 같은 5개교)',
    hint: "교명에 '하이텍'이 들어가는 전국 5개교 — 수원만 마이스터고(전기 전형)이고 나머지 4곳은 특성화고(후기 전형)라 지원 시기·학비 구조가 다릅니다",
    match: /하이텍/,
    pick: (s) => /하이텍/.test(s.name) || /하이텍/.test(s.shortName ?? ''),
    note: (s) => s.type,
  },
  { id: 'ai', emoji: '🤖', label: 'AI·디지털 중점', hint: 'AI·SW·데이터·에듀테크 교육과정을 전면에 내건 학교', match: /AI|A\.I|인공지능|SW|소프트웨어|디지털|정보|데이터|에듀테크|반도체/i },
  { id: 'science', emoji: '🔬', label: '과학·이공 중점', hint: '과학중점학교·이공 융합(의생명·공학·항공·에너지) 트랙', match: /과학|이공|공학|바이오|의·생명|의생명|보건|의료|항공|우주|에너지|실험/, pick: (s) => /과학중점/.test(s.specialCertification ?? '') },
  { id: 'culture', emoji: '🎨', label: '문화·예술·콘텐츠', hint: '예술·미디어·K-콘텐츠 특화 교육과정', match: /예술|문화|콘텐츠|미디어|K-|음악|체육|디자인/ },
  { id: 'eco', emoji: '🌱', label: '생태·해양·환경', hint: '생태전환·기후·해양 등 지역 자원 연계 과목', match: /생태|기후|환경|해양|에코/ },
  { id: 'humanities', emoji: '📚', label: '인문·글로벌', hint: '인문·고전·역사·다문화·글로벌 트랙', match: /인문|고전|역사|평화|다문화|글로벌|이중언어|사회|심리/ },
];

type FeatureSchool = { school: HighSchoolDetail; note?: string };

/** 지자체·교육청 같은 총칭 협약을 뺀 실제 대학·기업 협약기관만 추린다 */
function realPartners(school: HighSchoolDetail): string[] {
  const partners = school.jagonggoProfile?.partners ?? [];
  return partners
    .filter((p) => /대학|기업|기관|극장|박물관|동문/.test(`${p.type}${p.name}`))
    .filter((p) => !/협약기관|교육청/.test(p.name))
    .map((p) => p.name);
}

export function CategoryFeatureMap({
  schools,
  color,
  bgColor,
  onSelectSchool,
}: {
  schools: HighSchoolDetail[];
  color: string;
  bgColor: string;
  onSelectSchool?: (school: HighSchoolDetail) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  const tagText = (s: HighSchoolDetail) =>
    [...(s.listTags ?? []), ...(s.jagonggoProfile?.focusTracks ?? []).map((t) => t.name), s.jagonggoProfile?.brand ?? '']
      .join(' ');

  const buckets = FEATURE_BUCKETS.map((b) => ({
    ...b,
    items: schools
      .filter((s) => ((b.pick ? b.pick(s) : false) || b.match.test(tagText(s))) && !(b.exclude?.test(tagText(s)) ?? false))
      .map<FeatureSchool>((s) => ({
        school: s,
        note:
          (s.listTags ?? []).filter((t) => b.match.test(t)).join(' · ') ||
          b.note?.(s) ||
          undefined,
      })),
  })).filter((b) => b.items.length > 0);

  const partnerItems = schools
    .map<FeatureSchool>((s) => ({ school: s, note: realPartners(s).join(' · ') || undefined }))
    .filter((i) => i.note);

  const groups = [
    ...buckets,
    ...(partnerItems.length
      ? [{
          id: 'partner',
          emoji: '🤝',
          label: '지역 연계 대학·기업',
          hint: '대학·기업·문화기관과 실제 협약을 맺고 공동 과목·코티칭을 운영',
          items: partnerItems,
          sources: undefined as HighSchoolVerifySource[] | undefined,
        }]
      : []),
  ];

  if (groups.length === 0) return null;

  return (
    <div className="space-y-2">
      <SectionTitle color={color}>🧭 특색으로 학교 찾기</SectionTitle>
      <p className="text-[12px] text-gray-400 leading-relaxed -mt-1.5 mb-1">
        <HL text="같은 유형이라도 학교마다 ==중점 분야가 다릅니다==. AI 중점·과학중점·지역 대학/기업 연계 중 내 진로와 맞는 축부터 보세요." />
      </p>
      {groups.map((g) => {
        const open = (openId ?? groups[0]?.id) === g.id;
        return (
          <div
            key={g.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${color}33`,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? 'none' : g.id)}
              className="w-full px-3.5 py-3 text-left"
            >
              <p className="text-[13px] font-bold flex items-center justify-between gap-2" style={{ color }}>
                <span>{g.emoji} {g.label}</span>
                <span className="text-gray-500 font-normal">{g.items.length}교 {open ? '▲' : '▼'}</span>
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{g.hint}</p>
            </button>
            {open && (
              <div className="px-3.5 pb-3.5 flex flex-wrap gap-1.5">
                {g.items.map(({ school, note }) => {
                  const inner = (
                    <>
                      <span className="block text-[12px] font-semibold text-gray-100">
                        {school.emoji} {school.shortName ?? school.name}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">{note ?? school.location}</span>
                      <span className="block text-[10px] mt-0.5" style={{ color }}>
                        {onSelectSchool ? '상세 보기 ›' : school.websiteUrl ? '학교 홈페이지 ↗' : ''}
                      </span>
                    </>
                  );
                  const chipClass =
                    'px-2 py-1.5 rounded-xl text-left transition-colors hover:bg-white/10 focus-visible:bg-white/10 outline-none';
                  const chipStyle = { background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}22` };
                  // 이 유형 목록에 있는 학교는 상세로, 없으면 학교 홈페이지로 보낸다.
                  if (onSelectSchool) {
                    return (
                      <button key={school.id} type="button" onClick={() => onSelectSchool(school)} className={chipClass} style={chipStyle}>
                        {inner}
                      </button>
                    );
                  }
                  if (school.websiteUrl) {
                    return (
                      <a
                        key={school.id}
                        href={school.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={chipClass}
                        style={chipStyle}
                      >
                        {inner}
                      </a>
                    );
                  }
                  return (
                    <span key={school.id} className="px-2 py-1.5 rounded-xl text-left" style={chipStyle}>
                      {inner}
                    </span>
                  );
                })}
                {g.sources && g.sources.length > 0 && (
                  <div className="w-full pt-1">
                    <VerifySourceTable
                      sources={g.sources}
                      note={IB_VERIFY_NOTE}
                      color={color}
                      bgColor={bgColor}
                      title="🔎 이 학교들이 진짜 IB인지 확인하는 곳"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ── 10. 특색 축(중점 분야)별 대표 중점학교 지도 ────────────────────────────

export function CategoryFocusAxes({
  focus,
  color,
  bgColor,
  schools,
  onSelectSchool,
}: {
  focus?: HighSchoolFeatureFocus;
  color: string;
  bgColor: string;
  schools?: HighSchoolDetail[];
  onSelectSchool?: (school: HighSchoolDetail) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  // 축에 적힌 학교 이름(약칭/정식명)을 이 카테고리 데이터의 학교와 매칭 → 클릭 시 상세 팝업
  const findSchool = (rawName: string): HighSchoolDetail | undefined => {
    if (!schools) return undefined;
    const norm = (t: string) => t.replace(/\s+/g, '').replace(/\(.*?\)/g, '');
    const key = norm(rawName);
    return schools.find((s) => {
      const full = norm(s.name);
      const short = norm(s.shortName ?? '');
      return full === key || short === key || full.startsWith(key) || short === key;
    });
  };

  if (!focus || focus.axes.length === 0) return null;

  return (
    <div className="space-y-2">
      <SectionTitle color={color}>🎯 중점 분야로 갈리는 학교 지도</SectionTitle>
      <div
        className="rounded-2xl p-3.5"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${color}33` }}
      >
        <p className="text-[13px] font-bold" style={{ color }}>
          <HL text={focus.headline} />
        </p>
        {focus.intro && (
          <p className="text-[12px] text-gray-300 leading-relaxed mt-1.5">
            <HL text={focus.intro} />
          </p>
        )}
        <p className="text-[11px] text-gray-500 mt-1.5">기준 시점: {focus.asOf}</p>
      </div>

      <VerifySourceTable
        sources={focus.verifySources}
        note={focus.verifyNote}
        color={color}
        bgColor={bgColor}
      />

      {focus.axes.map((axis) => {
        const open = (openId ?? focus.axes[0].id) === axis.id;
        return (
          <div
            key={axis.id}
            className="rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`,
              border: `1px solid ${color}33`,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? 'none' : axis.id)}
              className="w-full px-3.5 py-3 text-left"
            >
              <p className="text-[13px] font-bold flex items-center justify-between gap-2" style={{ color }}>
                <span>{axis.emoji} {axis.label}</span>
                <span className="text-gray-500 font-normal">
                  {axis.schools.length > 0 ? `${axis.schools.length}곳 ` : ''}{open ? '▲' : '▼'}
                </span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                <HL text={axis.what} />
              </p>
            </button>

            {open && (
              <div className="px-3.5 pb-3.5 space-y-2.5">
                {axis.scale && (
                  <p className="text-[12px] text-gray-300 leading-relaxed">
                    📊 <HL text={axis.scale} />
                  </p>
                )}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}22` }}>
                  <p className="text-[11px] font-bold mb-1" style={{ color }}>🚪 들어가는 방법</p>
                  <p className="text-[12px] text-gray-200 leading-relaxed">
                    <HL text={axis.howToEnter} />
                  </p>
                </div>
                {axis.admissionNote && (
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}22` }}>
                    <p className="text-[11px] font-bold mb-1" style={{ color }}>🎓 2028 입시에서의 의미</p>
                    <p className="text-[12px] text-gray-200 leading-relaxed">
                      <HL text={axis.admissionNote} />
                    </p>
                  </div>
                )}
                <div className="space-y-1.5">
                  {axis.schools.map((school) => {
                    const matched = findSchool(school.name);
                    const clickable = Boolean(matched && onSelectSchool);
                    const rowStyle = { background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}22` };
                    const body = (
                      <>
                        <p className="text-[12px] font-semibold text-gray-100">
                          {school.name}
                          <span className="text-gray-400 font-normal"> · {school.region}</span>
                          {(school.inDataset || matched) && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: `${color}22`, color }}>
                              이 목록에 있음
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                          <HL text={school.fact} />
                        </p>
                        {clickable && (
                          <p className="text-[10px] mt-1 font-semibold" style={{ color }}>상세 보기 ›</p>
                        )}
                      </>
                    );
                    if (clickable) {
                      return (
                        <button
                          key={`${axis.id}-${school.name}`}
                          type="button"
                          onClick={() => onSelectSchool!(matched!)}
                          className="w-full text-left rounded-xl px-3 py-2 transition-colors hover:bg-white/10 focus-visible:bg-white/10 outline-none"
                          style={rowStyle}
                        >
                          {body}
                        </button>
                      );
                    }
                    return (
                      <div key={`${axis.id}-${school.name}`} className="rounded-xl px-3 py-2" style={rowStyle}>
                        {body}
                      </div>
                    );
                  })}
                </div>
                {axis.sources && axis.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {axis.sources.map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] px-2 py-1 rounded-lg underline"
                        style={{ background: 'rgba(255,255,255,0.05)', color: `${color}dd` }}
                      >
                        🔗 {src.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {focus.pickGuide && focus.pickGuide.length > 0 && (
        <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}2a` }}>
          <p className="text-[12px] font-bold mb-2" style={{ color }}>🧭 중점 축으로 학교 고르는 순서</p>
          <ul className="ml-1">
            {focus.pickGuide.map((step, index) => (
              <TreeLeaf key={step} text={step} color={color} last={index === focus.pickGuide!.length - 1} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
