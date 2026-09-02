'use client';

import { useState } from 'react';
import { ChevronRight, Rocket, X } from 'lucide-react';
import { GlossaryText } from '@/components/shared/GlossaryText';
import { Admission2027Map } from './Admission2027Map';

import {
  DevEducationInstitutionDetailPanel,
  InstitutionBadges,
  type DevEducationInstitution,
} from './DevEducationInstitutionDetailPanel';

/* ── 2027 대입 대전환 ─────────────────────────────────────────────
 * 고입(학교 유형 → 학교 목록 → 학교 상세)과 같은 흐름을 대입에 적용한다.
 *   영역(3개) → 정책 요약 + 대학 목록 → 대학 상세 다이얼로그
 * 대학 상세는 교육기관 상세 패널(DevEducationInstitutionDetailPanel)의
 * 스키마를 그대로 재사용해 UI 일관성을 유지한다. */

export type Admission2027KeyNumber = {
  readonly label: string;
  readonly value: string;
  readonly note?: string;
};

export type Admission2027TrackRow = {
  readonly track: string;
  readonly host: string;
  readonly target: string;
  readonly budget: string;
  readonly metro: string;
};

export type Admission2027PortfolioRow = {
  readonly criterion: string;
  readonly bad: string;
  readonly good: string;
};

export type Admission2027QA = { readonly q: string; readonly a: string };
export type Admission2027NowAction = {
  readonly grade: string;
  readonly goal: string;
  readonly actions: readonly string[];
};
export type Admission2027StudentGuide = {
  readonly title: string;
  readonly intro: string;
  readonly questions: readonly Admission2027QA[];
  readonly nowActions: readonly Admission2027NowAction[];
};

export type Admission2027DeepDive = {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly fullName: string;
  readonly tagline: string;
  readonly whatIsIt: string;
  readonly howItWorks: readonly string[];
  readonly numbers?: readonly Admission2027KeyNumber[];
  readonly types?: ReadonlyArray<{
    readonly name: string;
    readonly schools: string;
    readonly budget: string;
    readonly who: string;
    readonly meaning: string;
  }>;
  readonly whyLonger?: readonly string[];
  readonly studentValue?: readonly string[];
  readonly joinPath?: ReadonlyArray<{ readonly step: string; readonly what: string }>;
  readonly cautions?: readonly string[];
};

export type Admission2027MoneyScale = {
  readonly title: string;
  readonly intro: string;
  readonly rows: ReadonlyArray<{
    readonly item: string;
    readonly amount: string;
    readonly scale: string;
    readonly perStudent: string;
  }>;
  readonly ruler: ReadonlyArray<{ readonly label: string; readonly meaning: string }>;
};

export type Admission2027Area = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly emoji: string;
  readonly color: string;
  readonly bgColor: string;
  readonly headline: string;
  readonly description: string;
  readonly keyNumbers: readonly Admission2027KeyNumber[];
  readonly trackComparison?: readonly Admission2027TrackRow[];
  readonly portfolioQuality?: readonly Admission2027PortfolioRow[];
  readonly checkList: readonly string[];
  readonly cautions: readonly string[];
  readonly moneyScale?: Admission2027MoneyScale;
  readonly studentGuide?: Admission2027StudentGuide;
  readonly deepDive?: readonly Admission2027DeepDive[];
};

export type Admission2027AreaData = {
  readonly area: Admission2027Area;
  readonly universities: readonly DevEducationInstitution[];
};

export type Admission2027Labels = {
  readonly universityListTitle: string;
  readonly universityEmptyTitle: string;
  readonly universityEmptySubText: string;
};

type Admission2027ViewProps = {
  readonly areas: readonly Admission2027AreaData[];
  readonly labels: Admission2027Labels;
  readonly factCheckNotice?: string;
  readonly rightPanelTitle: string;
  readonly rightPanelSubtitle: string;
  readonly rightPanelColor?: string;
  readonly onClose?: () => void;
};

function SectionTitle({ emoji, text, color }: { emoji: string; text: string; color: string }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-white mb-2">
      <span aria-hidden>{emoji}</span>
      <span style={{ color }}>{text}</span>
    </h3>
  );
}

export function Admission2027View({
  areas,
  labels,
  factCheckNotice,
  rightPanelTitle,
  rightPanelSubtitle,
  rightPanelColor = '#22D3EE',
  onClose,
}: Admission2027ViewProps) {
  /* 1번째 영역을 기본 선택한다 (빈 화면을 먼저 보여주지 않는다) */
  const [selectedAreaId, setSelectedAreaId] = useState<string>(areas[0]?.area.id ?? '');
  const [selectedUniversity, setSelectedUniversity] = useState<DevEducationInstitution | null>(null);

  const handleSelectUniversityById = (universityId: string) => {
    for (const a of areas) {
      const hit = a.universities.find((u) => u.id === universityId);
      if (hit) {
        if (a.area.id !== selectedAreaId) setSelectedAreaId(a.area.id);
        setSelectedUniversity(hit);
        return;
      }
    }
  };

  const current = areas.find((a) => a.area.id === selectedAreaId) ?? areas[0];
  if (!current) return null;
  const { area, universities } = current;

  return (
    <>
      {/* 헤더 */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{
          background: `linear-gradient(135deg, ${rightPanelColor}30, ${rightPanelColor}10)`,
          borderBottom: `1px solid ${rightPanelColor}35`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <Rocket className="w-5 h-5 flex-shrink-0" style={{ color: rightPanelColor }} />
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">{rightPanelTitle}</h2>
            <p className="text-[12px] mt-0.5" style={{ color: `${rightPanelColor}cc` }}>
              {rightPanelSubtitle}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:rotate-90"
            style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${rightPanelColor}50` }}
            aria-label="닫기"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* ── 1단계: 3개 영역 선택 ── */}
        <div className="grid grid-cols-3 gap-2">
          {areas.map(({ area: a }) => {
            const isActive = a.id === area.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAreaId(a.id);
                  setSelectedUniversity(null);
                }}
                className="rounded-xl px-2 py-3 text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: isActive ? a.bgColor : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isActive ? a.color : 'rgba(255,255,255,0.12)'}`,
                  boxShadow: isActive ? `0 0 16px ${a.color}40` : undefined,
                }}
                aria-pressed={isActive}
              >
                <div className="text-xl mb-1" aria-hidden>
                  {a.emoji}
                </div>
                <div
                  className="text-[12px] font-bold leading-tight"
                  style={{ color: isActive ? a.color : 'rgba(255,255,255,0.7)' }}
                >
                  {a.shortName}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── 2단계: 선택한 영역의 정책 상세 (먼저 제도를 이해한다) ── */}
        <div
          className="rounded-xl p-4 space-y-4"
          style={{ background: area.bgColor, border: `1px solid ${area.color}45` }}
        >
          <div>
            <h3 className="text-[15px] font-black text-white leading-snug mb-1"><GlossaryText>{area.headline}</GlossaryText></h3>
            <p className="text-xs text-white/75 leading-relaxed"><GlossaryText>{area.description}</GlossaryText></p>
          </div>

          {/* 핵심 숫자 */}
          <div>
            <SectionTitle emoji="📊" text="핵심 숫자" color={area.color} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {area.keyNumbers.map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg px-3 py-2"
                  style={{ background: 'rgba(15,23,42,0.55)', border: `1px solid ${area.color}30` }}
                >
                  <div className="text-[11px] text-white/55">{k.label}</div>
                  <div
                    className="text-[15px] font-black tracking-tight mt-0.5 inline-block rounded px-1.5 py-0.5"
                    style={{ color: area.color, background: `${area.color}1f` }}
                  >
                    {k.value}
                  </div>
                  {k.note && <div className="text-[11px] text-white/50 mt-0.5 leading-snug"><GlossaryText>{k.note}</GlossaryText></div>}
                </div>
              ))}
            </div>
          </div>

          {/* 액수 감 잡기 — 숫자에 크기 감각을 붙인다 */}
          {area.moneyScale && (
            <div>
              <SectionTitle emoji="💰" text={area.moneyScale.title} color={area.color} />
              <p className="text-[12px] text-white/70 leading-relaxed mb-2">
                <GlossaryText>{area.moneyScale.intro}</GlossaryText>
              </p>

              <div className="space-y-2">
                {area.moneyScale.rows.map((r) => (
                  <div
                    key={r.item}
                    className="rounded-lg px-3 py-2"
                    style={{ background: 'rgba(2,6,23,0.55)', border: `1px solid ${area.color}30` }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                      <span className="text-[12px] text-white/70">{r.item}</span>
                      <span
                        className="text-[15px] font-black tracking-tight rounded px-1.5 py-0.5"
                        style={{ color: area.color, background: `${area.color}1f` }}
                      >
                        {r.amount}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-white/70 mt-1 leading-relaxed">
                      <GlossaryText>{r.scale}</GlossaryText>
                    </div>
                    <div className="text-[11px] text-white/45 mt-0.5 leading-relaxed">
                      <GlossaryText>{r.perStudent}</GlossaryText>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-2 rounded-lg px-3 py-2"
                style={{ background: `${area.color}12`, border: `1px dashed ${area.color}55` }}
              >
                <div className="text-[11px] font-bold text-white/80 mb-1.5">📏 금액 자 — 이 정도 크기입니다</div>
                <div className="space-y-1">
                  {area.moneyScale.ruler.map((r) => (
                    <div key={r.label} className="flex gap-2 text-[11.5px] leading-relaxed">
                      <span
                        className="flex-shrink-0 font-black rounded px-1.5 py-0.5 h-fit"
                        style={{ color: area.color, background: `${area.color}22` }}
                      >
                        {r.label}
                      </span>
                      <span className="text-white/70">
                        <GlossaryText>{r.meaning}</GlossaryText>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 트랙 비교 (있는 영역만) */}
          {area.trackComparison && area.trackComparison.length > 0 && (
            <div>
              <SectionTitle emoji="🧭" text="트랙 비교 — 헷갈리는 사업 구분" color={area.color} />
              <div className="space-y-2">
                {area.trackComparison.map((t) => (
                  <div
                    key={t.track}
                    className="rounded-lg px-3 py-2"
                    style={{ background: 'rgba(15,23,42,0.55)', border: `1px solid ${area.color}30` }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[13px] font-bold text-white">{t.track}</span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: `${area.color}30`, color: 'white' }}
                      >
                        {t.host}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/70 leading-relaxed">
                      <div>· 대상: {t.target}</div>
                      <div>
                        · 규모:{' '}
                        <span
                          className="font-black rounded px-1 py-0.5"
                          style={{ color: area.color, background: `${area.color}1f` }}
                        >
                          {t.budget}
                        </span>
                      </div>
                      <div>· 특징: {t.metro}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 포트폴리오 품질 기준 (있는 영역만) */}
          {area.portfolioQuality && area.portfolioQuality.length > 0 && (
            <div>
              <SectionTitle emoji="🎒" text="포트폴리오 품질 기준" color={area.color} />
              <div className="space-y-2">
                {area.portfolioQuality.map((p) => (
                  <div
                    key={p.criterion}
                    className="rounded-lg px-3 py-2"
                    style={{ background: 'rgba(15,23,42,0.55)', border: `1px solid ${area.color}30` }}
                  >
                    <div className="text-[13px] font-bold text-white mb-1">{p.criterion}</div>
                    <div className="text-[11px] text-rose-300/90 leading-snug">✕ {p.bad}</div>
                    <div className="text-[11px] text-emerald-300/90 leading-snug mt-0.5">○ {p.good}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 체크리스트 */}
          <div>
            <SectionTitle emoji="✅" text="지원 전 체크리스트" color={area.color} />
            <ul className="space-y-1">
              {area.checkList.map((c) => (
                <li key={c} className="flex gap-2 text-[12px] text-white/75 leading-relaxed">
                  <span className="flex-shrink-0" style={{ color: area.color }} aria-hidden>
                    ☐
                  </span>
                  <span><GlossaryText>{c}</GlossaryText></span>
                </li>
              ))}
            </ul>
          </div>

          {/* 주의사항 */}
          <div>
            <SectionTitle emoji="⚠️" text="주의할 점" color="#FCA5A5" />
            <ul className="space-y-1">
              {area.cautions.map((c) => (
                <li key={c} className="flex gap-2 text-[12px] text-amber-100/80 leading-relaxed">
                  <span className="flex-shrink-0 text-amber-300" aria-hidden>
                    ·
                  </span>
                  <span><GlossaryText>{c}</GlossaryText></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 사실 확인 안내 */}
        {factCheckNotice && (
          <p
            className="rounded-lg px-3 py-2 text-[11px] leading-relaxed text-amber-100/85"
            style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            <GlossaryText>{factCheckNotice}</GlossaryText>
          </p>
        )}

        {/* ── 고등학생 눈높이 Q&A ── */}
        {area.studentGuide && (
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${area.color}35` }}
          >
            <div>
              <h3 className="text-[14px] font-black text-white flex items-center gap-1.5">
                <span aria-hidden>🙋</span>
                {area.studentGuide.title}
              </h3>
              <p className="text-[12px] text-white/70 mt-1 leading-relaxed">
                <GlossaryText>{area.studentGuide.intro}</GlossaryText>
              </p>
            </div>

            <div className="space-y-2">
              {area.studentGuide.questions.map((qa) => (
                <details
                  key={qa.q}
                  className="rounded-lg px-3 py-2 group"
                  style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${area.color}25` }}
                >
                  <summary className="cursor-pointer select-none text-[12.5px] font-bold text-white/90 leading-snug marker:text-transparent list-none flex gap-2">
                    <span className="flex-shrink-0" style={{ color: area.color }} aria-hidden>
                      Q
                    </span>
                    <span>{qa.q}</span>
                  </summary>
                  <p className="mt-2 pl-5 text-[12px] text-white/75 leading-relaxed">
                    <GlossaryText>{qa.a}</GlossaryText>
                  </p>
                </details>
              ))}
            </div>

            <div>
              <SectionTitle emoji="📌" text="지금 학년에서 할 일" color={area.color} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {area.studentGuide.nowActions.map((n) => (
                  <div
                    key={n.grade}
                    className="rounded-lg px-3 py-2"
                    style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${area.color}25` }}
                  >
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-[13px] font-black" style={{ color: area.color }}>
                        {n.grade}
                      </span>
                      <span className="text-[11px] text-white/55">{n.goal}</span>
                    </div>
                    <ul className="space-y-1">
                      {n.actions.map((act) => (
                        <li key={act} className="text-[11.5px] text-white/75 leading-relaxed flex gap-1.5">
                          <span className="flex-shrink-0 text-white/35" aria-hidden>
                            ·
                          </span>
                          <span>
                            <GlossaryText>{act}</GlossaryText>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 제도 깊이 보기 (LINC 3.0 · IPP · 창업 3종 · 계약학과 등) ── */}
        {area.deepDive && area.deepDive.length > 0 && (
          <div className="space-y-2">
            <SectionTitle emoji="📖" text="제도 깊이 알아보기" color={area.color} />
            {area.deepDive.map((dd) => (
              <details
                key={dd.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${area.color}35` }}
              >
                <summary className="cursor-pointer select-none list-none marker:text-transparent px-4 py-3 flex items-start gap-3 hover:bg-white/[0.03]">
                  <span className="text-xl flex-shrink-0" aria-hidden>
                    {dd.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-black text-white">
                      {dd.name}
                      <span className="ml-1.5 text-[11px] font-normal text-white/45">{dd.fullName}</span>
                    </span>
                    <span className="block text-[12px] text-white/70 mt-0.5 leading-snug">
                      <GlossaryText>{dd.tagline}</GlossaryText>
                    </span>
                  </span>
                  <span className="flex-shrink-0 text-white/35 text-xs mt-1">펼치기 ▾</span>
                </summary>

                <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: `${area.color}25` }}>
                  <p className="text-[12.5px] text-white/80 leading-relaxed pt-3">
                    <GlossaryText>{dd.whatIsIt}</GlossaryText>
                  </p>

                  <div>
                    <SectionTitle emoji="⚙️" text="어떻게 돌아가나" color={area.color} />
                    <ol className="space-y-1">
                      {dd.howItWorks.map((h) => (
                        <li key={h} className="text-[12px] text-white/75 leading-relaxed">
                          <GlossaryText>{h}</GlossaryText>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {dd.numbers && dd.numbers.length > 0 && (
                    <div>
                      <SectionTitle emoji="🔢" text="숫자로 보기" color={area.color} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dd.numbers.map((n) => (
                          <div
                            key={n.label}
                            className="rounded-lg px-3 py-2"
                            style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${area.color}25` }}
                          >
                            <div className="text-[11px] text-white/55">{n.label}</div>
                            <div className="text-[13px] font-bold" style={{ color: area.color }}>
                              {n.value}
                            </div>
                            {n.note && (
                              <div className="text-[11px] text-white/50 mt-0.5 leading-snug">
                                <GlossaryText>{n.note}</GlossaryText>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dd.types && dd.types.length > 0 && (
                    <div>
                      <SectionTitle emoji="🗂️" text="유형별로 다릅니다" color={area.color} />
                      <div className="space-y-2">
                        {dd.types.map((t) => (
                          <div
                            key={t.name}
                            className="rounded-lg px-3 py-2"
                            style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${area.color}25` }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-[13px] font-bold text-white">{t.name}</span>
                              <span
                                className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: `${area.color}30`, color: 'white' }}
                              >
                                {t.budget}
                              </span>
                            </div>
                            <div className="text-[11px] text-white/60">{t.schools}</div>
                            <div className="text-[11px] text-white/70 mt-1 leading-relaxed">{t.who}</div>
                            <div className="text-[11.5px] text-white/80 mt-1 leading-relaxed">
                              <GlossaryText>{t.meaning}</GlossaryText>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dd.whyLonger && dd.whyLonger.length > 0 && (
                    <div>
                      <SectionTitle emoji="⏱️" text="왜 4~6개월이어야 하나" color={area.color} />
                      <ul className="space-y-1">
                        {dd.whyLonger.map((w) => (
                          <li key={w} className="text-[12px] text-white/75 leading-relaxed flex gap-1.5">
                            <span className="flex-shrink-0 text-white/35" aria-hidden>
                              ·
                            </span>
                            <span>
                              <GlossaryText>{w}</GlossaryText>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dd.studentValue && dd.studentValue.length > 0 && (
                    <div>
                      <SectionTitle emoji="🎁" text="학생에게 남는 것" color={area.color} />
                      <ul className="space-y-1">
                        {dd.studentValue.map((v) => (
                          <li key={v} className="text-[12px] text-emerald-100/85 leading-relaxed flex gap-1.5">
                            <span className="flex-shrink-0 text-emerald-300" aria-hidden>
                              ○
                            </span>
                            <span>
                              <GlossaryText>{v}</GlossaryText>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {dd.joinPath && dd.joinPath.length > 0 && (
                    <div>
                      <SectionTitle emoji="🪜" text="언제 무엇을 하면 되나" color={area.color} />
                      <div className="space-y-1.5">
                        {dd.joinPath.map((j) => (
                          <div key={j.step} className="flex gap-2 text-[12px] leading-relaxed">
                            <span
                              className="flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold h-fit"
                              style={{ background: `${area.color}25`, color: area.color }}
                            >
                              {j.step}
                            </span>
                            <span className="text-white/75">
                              <GlossaryText>{j.what}</GlossaryText>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dd.cautions && dd.cautions.length > 0 && (
                    <div>
                      <SectionTitle emoji="⚠️" text="놓치면 손해 보는 것" color="#FCA5A5" />
                      <ul className="space-y-1">
                        {dd.cautions.map((c) => (
                          <li key={c} className="text-[12px] text-amber-100/80 leading-relaxed flex gap-1.5">
                            <span className="flex-shrink-0 text-amber-300" aria-hidden>
                              ·
                            </span>
                            <span>
                              <GlossaryText>{c}</GlossaryText>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}

        {/* ── 5번째: 전국 대학 위치 지도 (바로 아래 대학 목록과 함께 본다) ── */}
        <Admission2027Map selectedAreaId={area.id} onSelectUniversity={handleSelectUniversityById} />

        {/* ── 6번째: 이 영역의 대학 목록 (지도 바로 아래) ── */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-[13px] font-bold text-white">
              {labels.universityListTitle}
              <span className="ml-1.5 text-[11px] font-normal text-white/50">{universities.length}개교</span>
            </h3>
            <span className="text-[11px] text-white/45">{labels.universityEmptySubText}</span>
          </div>

          <div className="panel-pop-stagger space-y-2">
            {universities.map((univ) => (
              <button
                key={univ.id}
                type="button"
                onClick={() => setSelectedUniversity(univ)}
                className="w-full text-left rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99] group"
                style={{ background: univ.bgColor, border: `1px solid ${univ.color}40` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${univ.color}20`, border: `2px solid ${univ.color}` }}
                  >
                    {univ.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white mb-0.5">{univ.name}</h4>
                    <p className="text-[11px] text-white/55 mb-1">
                      {univ.organizer}
                      {univ.location && (
                        <>
                          {' · '}
                          <span className="text-sky-200/80">📍 {univ.location.city}</span>
                          {univ.location.singleCampus === false && (
                            <span className="ml-1 text-amber-300/90">⚠ 캠퍼스 2곳 이상</span>
                          )}
                        </>
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: `${univ.color}30`, color: 'white' }}
                      >
                        {univ.type}
                      </span>
                    </div>
                    {univ.badges && univ.badges.length > 0 && (
                      <div className="mt-1.5">
                        <InstitutionBadges badges={univ.badges} size="sm" />
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 대학 상세 다이얼로그 */}
      {selectedUniversity && (
        <DevEducationInstitutionDetailPanel
          institution={selectedUniversity}
          onClose={() => setSelectedUniversity(null)}
          variant="dialog"
        />
      )}
    </>
  );
}
