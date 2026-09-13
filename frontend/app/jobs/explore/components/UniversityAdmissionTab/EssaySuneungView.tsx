'use client';

import { useState } from 'react';
import { PenLine, X, ExternalLink } from 'lucide-react';
import { GlossaryText } from '@/components/shared/GlossaryText';

/* ── 논·서술형 수능 (미래형 수능) ────────────────────────────────
 * 정답을 고르는 수능에서 '생각을 쓰는' 수능으로 가는 흐름을,
 * 이미 서·논술형 국가시험을 운영하는 해외 5개국의 실제 기출로 설명한다.
 *   한국 현황(검토·공론화 단계) → 5개국 기출·준비법 → 학년별 로드맵
 * 국가(5개)를 고르면 그 나라의 시험 형식·기출·한국 학생 시사점이 열린다. */

export type EssaySuneungPastQuestion = {
  readonly year: string;
  readonly subject: string;
  readonly prompt: string;
  readonly orig?: string;
  readonly points?: string;
};

export type EssaySuneungCountry = {
  readonly id: string;
  readonly flag: string;
  readonly name: string;
  readonly examName: string;
  readonly color: string;
  readonly bgColor: string;
  readonly format: string;
  readonly whatItTests: string;
  readonly pastQuestions: readonly EssaySuneungPastQuestion[];
  readonly koreaLesson: string;
  readonly prepTips: readonly string[];
};

export type EssaySuneungKorea = {
  readonly headline: string;
  readonly statusBadge: string;
  readonly whatIsIt: string;
  readonly whyNow: readonly string[];
  readonly timeline: ReadonlyArray<{ readonly step: string; readonly what: string }>;
  readonly keyNumbers: ReadonlyArray<{ readonly label: string; readonly value: string; readonly note?: string }>;
  readonly debates: ReadonlyArray<{ readonly point: string; readonly detail: string }>;
  readonly referenceVideo?: {
    readonly title: string;
    readonly channel?: string;
    readonly url: string;
    readonly note?: string;
  };
  readonly expertViews?: ReadonlyArray<{
    readonly name: string;
    readonly role?: string;
    readonly videoTitle?: string;
    readonly videoUrl?: string;
    readonly points: readonly string[];
  }>;
};

export type EssaySuneungCurriculumStage = {
  readonly id: string;
  readonly label: string;
  readonly emoji: string;
  readonly age: string;
  readonly goal: string;
  readonly process: ReadonlyArray<{ readonly step: string; readonly detail: string }>;
  readonly perspectives: ReadonlyArray<{ readonly lens: string; readonly emoji: string; readonly text: string }>;
  readonly routine: string;
  readonly output: string;
  readonly bridge: string;
};

export type EssaySuneungIbStage = {
  readonly code: string;
  readonly name: string;
  readonly age: string;
  readonly color: string;
  readonly focus: string;
  readonly essay: string;
  readonly capstone: string;
};

export type EssaySuneungRoadmap = {
  readonly intro: string;
  readonly curriculum: {
    readonly intro: string;
    readonly stages: readonly EssaySuneungCurriculumStage[];
    readonly ibToKb: {
      readonly label: string;
      readonly emoji: string;
      readonly title: string;
      readonly intro: string;
      readonly trendNote: string;
      readonly stages: readonly EssaySuneungIbStage[];
    };
  };
  readonly commonSkills: ReadonlyArray<{ readonly skill: string; readonly how: string }>;
};

export type EssaySuneungMultiPerspective = {
  readonly title: string;
  readonly intro: string;
  readonly example: {
    readonly prompt: string;
    readonly source?: string;
    readonly lenses: ReadonlyArray<{
      readonly lens: string;
      readonly emoji: string;
      readonly thesis: string;
      readonly basis: string;
      readonly conclusion: string;
    }>;
  };
  readonly practiceSteps: ReadonlyArray<{ readonly step: string; readonly detail: string }>;
  readonly tip?: string;
  readonly otherPrompts?: ReadonlyArray<{ readonly prompt: string; readonly hint: string }>;
};

export type EssaySuneungContent = {
  readonly meta: {
    readonly id: string;
    readonly title: string;
    readonly subtitle: string;
    readonly emoji: string;
    readonly color: string;
    readonly bgColor: string;
  };
  readonly labels: { readonly countrySelectTitle: string; readonly countryListSubText: string };
  readonly korea: EssaySuneungKorea;
  readonly countries: readonly EssaySuneungCountry[];
  readonly prepRoadmap: EssaySuneungRoadmap;
  readonly multiPerspective?: EssaySuneungMultiPerspective;
  readonly cautions: readonly string[];
  readonly factCheckNotice?: string;
  readonly sources?: ReadonlyArray<{ readonly label: string; readonly url: string }>;
};

type EssaySuneungViewProps = {
  readonly content: EssaySuneungContent;
  readonly onClose?: () => void;
};

/** 관점(렌즈)별로 다른 색을 줘서 '답안이 완전히 달라진다'를 시각적으로 보여준다 */
const LENS_COLORS = ['#A78BFA', '#34D399', '#F472B6', '#FBBF24', '#60A5FA'];

/** 긴 내용을 상단 탭 4개로 그룹핑 — 직관적 탐색 */
const TOP_TABS = [
  { id: 'korea', emoji: '📍', label: '한국 현황' },
  { id: 'exams', emoji: '🌍', label: '해외 기출' },
  { id: 'curriculum', emoji: '🧭', label: '준비 커리큘럼' },
  { id: 'practice', emoji: '🎭', label: '관점 연습' },
] as const;

function SectionTitle({ emoji, text, color }: { emoji: string; text: string; color: string }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-white mb-2">
      <span aria-hidden>{emoji}</span>
      <span style={{ color }}>{text}</span>
    </h3>
  );
}

export function EssaySuneungView({ content, onClose }: EssaySuneungViewProps) {
  const { meta, labels, korea, countries, prepRoadmap, multiPerspective, cautions, factCheckNotice, sources } = content;
  const accent = meta.color;

  /* 상단 탭 — 한국 현황 / 해외 기출 / 준비 커리큘럼 / 관점 연습 (기본: 한국 현황) */
  const [topTab, setTopTab] = useState<string>('korea');

  /* 1번째 나라를 기본 선택한다 (빈 화면을 먼저 보여주지 않는다) */
  const [selectedCountryId, setSelectedCountryId] = useState<string>(countries[0]?.id ?? '');
  const country = countries.find((c) => c.id === selectedCountryId) ?? countries[0];

  /* 기출은 기본 2개만 보여주고 나머지는 아코디언으로 (나라 바꾸면 접힘) */
  const DEFAULT_VISIBLE_Q = 2;
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const handleSelectCountry = (id: string) => {
    setSelectedCountryId(id);
    setShowAllQuestions(false);
  };

  /* 생애주기 커리큘럼 탭 — 초/중/고 + IB→KB (1번째 기본 선택) */
  const curriculum = prepRoadmap.curriculum;
  const IB_TAB = 'ib-to-kb';
  const [curriculumTab, setCurriculumTab] = useState<string>(curriculum.stages[0]?.id ?? '');
  const activeStage = curriculum.stages.find((s) => s.id === curriculumTab);

  return (
    <div className="flex flex-col max-h-[85vh] overflow-y-auto">
      {/* 헤더 */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3"
        style={{
          background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
          borderBottom: `1px solid ${accent}35`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <PenLine className="w-5 h-5 flex-shrink-0" style={{ color: accent }} />
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">{meta.title}</h2>
            <p className="text-[12px] mt-0.5" style={{ color: `${accent}cc` }}>
              {meta.subtitle}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:rotate-90"
            style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${accent}50` }}
            aria-label="닫기"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        )}
      </div>

      {/* 상단 탭 — sticky */}
      <div className="sticky top-0 z-20 bg-[#0f172a] px-4 pt-3 pb-2">
        <div className="grid grid-cols-4 gap-1.5">
          {TOP_TABS.map((t) => {
            const on = topTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTopTab(t.id)}
                className="rounded-lg px-1 py-2 text-center transition-all active:scale-[0.97]"
                style={{ background: on ? `${accent}2a` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${on ? accent : 'rgba(255,255,255,0.12)'}` }}
                aria-pressed={on}
              >
                <div className="text-base leading-none mb-0.5" aria-hidden>{t.emoji}</div>
                <div className="text-[11px] font-bold leading-tight" style={{ color: on ? accent : 'rgba(255,255,255,0.7)' }}>{t.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* ═══════ 탭: 한국 현황 ═══════ */}
        {topTab === 'korea' && (
        <>
        {/* ── 1단계: 한국 현황 (제도부터 정확히 이해) ── */}
        <div className="rounded-xl p-4 space-y-4" style={{ background: meta.bgColor, border: `1px solid ${accent}45` }}>
          <div>
            <span
              className="inline-block text-[11px] font-bold rounded-full px-2.5 py-0.5 mb-2"
              style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}50` }}
            >
              {korea.statusBadge}
            </span>
            <h3 className="text-[15px] font-black text-white leading-snug mb-1">
              <GlossaryText>{korea.headline}</GlossaryText>
            </h3>
            <p className="text-xs text-white/75 leading-relaxed">
              <GlossaryText>{korea.whatIsIt}</GlossaryText>
            </p>
          </div>

          {/* 왜 지금 논의되나 */}
          <div>
            <SectionTitle emoji="🤔" text="왜 지금 논의될까" color={accent} />
            <ul className="space-y-1">
              {korea.whyNow.map((w) => (
                <li key={w} className="flex gap-2 text-[12px] text-white/75 leading-relaxed">
                  <span className="flex-shrink-0" style={{ color: accent }} aria-hidden>
                    ·
                  </span>
                  <span>
                    <GlossaryText>{w}</GlossaryText>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 핵심 숫자 */}
          <div>
            <SectionTitle emoji="📊" text="핵심 숫자" color={accent} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {korea.keyNumbers.map((k) => (
                <div
                  key={k.label}
                  className="rounded-lg px-3 py-2"
                  style={{ background: 'rgba(15,23,42,0.55)', border: `1px solid ${accent}30` }}
                >
                  <div className="text-[11px] text-white/55">{k.label}</div>
                  <div
                    className="text-[15px] font-black tracking-tight mt-0.5 inline-block rounded px-1.5 py-0.5"
                    style={{ color: accent, background: `${accent}1f` }}
                  >
                    {k.value}
                  </div>
                  {k.note && <div className="text-[11px] text-white/50 mt-0.5 leading-snug">{k.note}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 추진 일정 */}
          <div>
            <SectionTitle emoji="🗓️" text="추진 일정 (검토·공론화 단계)" color={accent} />
            <div className="space-y-1.5">
              {korea.timeline.map((t) => (
                <div key={t.step} className="flex gap-2 text-[12px] leading-relaxed">
                  <span
                    className="flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold h-fit"
                    style={{ background: `${accent}25`, color: accent }}
                  >
                    {t.step}
                  </span>
                  <span className="text-white/75">
                    <GlossaryText>{t.what}</GlossaryText>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 쟁점 */}
          <div>
            <SectionTitle emoji="⚖️" text="풀어야 할 쟁점" color={accent} />
            <div className="space-y-2">
              {korea.debates.map((d) => (
                <div
                  key={d.point}
                  className="rounded-lg px-3 py-2"
                  style={{ background: 'rgba(15,23,42,0.55)', border: `1px solid ${accent}30` }}
                >
                  <div className="text-[12.5px] font-bold text-white mb-0.5">{d.point}</div>
                  <div className="text-[11.5px] text-white/70 leading-relaxed">
                    <GlossaryText>{d.detail}</GlossaryText>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 참조 영상 */}
          {korea.referenceVideo && (
            <a
              href={korea.referenceVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)' }}
            >
              <span className="text-xl flex-shrink-0" aria-hidden>
                ▶️
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[12.5px] font-bold text-white leading-snug">{korea.referenceVideo.title}</span>
                {korea.referenceVideo.note && (
                  <span className="block text-[11px] text-white/60 mt-0.5 leading-snug">
                    {korea.referenceVideo.channel ? `${korea.referenceVideo.channel} · ` : ''}
                    {korea.referenceVideo.note}
                  </span>
                )}
              </span>
              <ExternalLink className="w-4 h-4 text-white/50 flex-shrink-0" />
            </a>
          )}

          {/* 전문가 시각 */}
          {korea.expertViews && korea.expertViews.length > 0 && (
            <div>
              <SectionTitle emoji="🎓" text="전문가는 이렇게 봅니다" color={accent} />
              <div className="space-y-2">
                {korea.expertViews.map((ev) => (
                  <div
                    key={ev.name}
                    className="rounded-lg px-3 py-2.5"
                    style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}30` }}
                  >
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-[12.5px] font-bold text-white">{ev.name}</span>
                      {ev.role && <span className="text-[11px] text-white/50">{ev.role}</span>}
                    </div>
                    <ul className="space-y-1">
                      {ev.points.map((p) => (
                        <li key={p} className="flex gap-2 text-[12px] text-white/75 leading-relaxed">
                          <span className="flex-shrink-0" style={{ color: accent }} aria-hidden>
                            ·
                          </span>
                          <span>
                            <GlossaryText>{p}</GlossaryText>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {ev.videoUrl && (
                      <a
                        href={ev.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-sky-300/85 hover:text-sky-200"
                      >
                        <span aria-hidden>▶️</span>
                        <span className="underline underline-offset-2">{ev.videoTitle ?? '관련 영상 보기'}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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

        </>
        )}

        {/* ═══════ 탭: 해외 기출 ═══════ */}
        {topTab === 'exams' && (
        <>
        {/* ── 2단계: 해외 5개국 기출로 배우기 ── */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="text-[13px] font-bold text-white">
              🌍 해외 5개국 논·서술형 국가시험
              <span className="ml-1.5 text-[11px] font-normal text-white/50">{countries.length}개국</span>
            </h3>
          </div>
          <p className="text-[11px] text-white/50 mb-2">{labels.countryListSubText}</p>

          {/* 국가 선택 */}
          <div className="grid grid-cols-5 gap-2 mb-3">
            {countries.map((c) => {
              const isActive = c.id === country?.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectCountry(c.id)}
                  className="rounded-xl px-1 py-2.5 text-center transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: isActive ? c.bgColor : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isActive ? c.color : 'rgba(255,255,255,0.12)'}`,
                    boxShadow: isActive ? `0 0 16px ${c.color}40` : undefined,
                  }}
                  aria-pressed={isActive}
                >
                  <div className="text-xl mb-0.5" aria-hidden>
                    {c.flag}
                  </div>
                  <div
                    className="text-[11px] font-bold leading-tight"
                    style={{ color: isActive ? c.color : 'rgba(255,255,255,0.7)' }}
                  >
                    {c.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 선택한 국가 상세 */}
          {country && (
            <div className="rounded-xl p-4 space-y-4" style={{ background: country.bgColor, border: `1px solid ${country.color}45` }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl" aria-hidden>
                    {country.flag}
                  </span>
                  <div>
                    <h4 className="text-[14px] font-black text-white leading-tight">{country.examName}</h4>
                    <span className="text-[11px]" style={{ color: country.color }}>
                      {country.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* 시험 형식 */}
              <div>
                <SectionTitle emoji="📝" text="시험은 이렇게 봅니다" color={country.color} />
                <p className="text-[12px] text-white/75 leading-relaxed">
                  <GlossaryText>{country.format}</GlossaryText>
                </p>
              </div>

              {/* 무엇을 보나 */}
              <div>
                <SectionTitle emoji="🎯" text="무엇을 평가하나" color={country.color} />
                <p className="text-[12px] text-white/75 leading-relaxed">
                  <GlossaryText>{country.whatItTests}</GlossaryText>
                </p>
              </div>

              {/* 실제 기출 — 기본 2개 + 아코디언 */}
              <div>
                <SectionTitle
                  emoji="🗂️"
                  text={`실제 기출 · 최근 (${country.pastQuestions.length}개)`}
                  color={country.color}
                />
                <div className="space-y-2">
                  {(showAllQuestions ? country.pastQuestions : country.pastQuestions.slice(0, DEFAULT_VISIBLE_Q)).map((q) => (
                    <div
                      key={`${q.year}-${q.subject}-${q.prompt}`}
                      className="rounded-lg px-3 py-2"
                      style={{ background: 'rgba(2,6,23,0.55)', border: `1px solid ${country.color}30` }}
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className="text-[10.5px] font-bold rounded px-1.5 py-0.5"
                          style={{ background: `${country.color}25`, color: country.color }}
                        >
                          {q.year}
                        </span>
                        <span className="text-[11px] text-white/55">{q.subject}</span>
                        {q.points && <span className="text-[10.5px] text-white/45">· {q.points}</span>}
                      </div>
                      <p className="text-[12.5px] text-white/90 leading-relaxed font-medium">“{q.prompt}”</p>
                      {q.orig && <p className="text-[11px] text-white/45 mt-1 leading-snug italic">{q.orig}</p>}
                    </div>
                  ))}
                </div>

                {country.pastQuestions.length > DEFAULT_VISIBLE_Q && (
                  <button
                    type="button"
                    onClick={() => setShowAllQuestions((v) => !v)}
                    className="mt-2 w-full rounded-lg py-2 text-[12px] font-bold transition-all hover:brightness-110 active:scale-[0.99]"
                    style={{ background: `${country.color}1f`, border: `1px solid ${country.color}45`, color: country.color }}
                    aria-expanded={showAllQuestions}
                  >
                    {showAllQuestions
                      ? '기출 접기 ▲'
                      : `기출 ${country.pastQuestions.length - DEFAULT_VISIBLE_Q}개 더 보기 ▾`}
                  </button>
                )}
              </div>

              {/* 한국 학생이 배울 점 */}
              <div className="rounded-lg px-3 py-2.5" style={{ background: `${country.color}12`, border: `1px dashed ${country.color}55` }}>
                <div className="text-[11px] font-bold text-white/85 mb-1">💡 한국 학생이 배울 점</div>
                <p className="text-[12px] text-white/80 leading-relaxed">
                  <GlossaryText>{country.koreaLesson}</GlossaryText>
                </p>
              </div>

              {/* 준비 팁 */}
              <div>
                <SectionTitle emoji="✅" text="이렇게 준비하세요" color={country.color} />
                <ul className="space-y-1">
                  {country.prepTips.map((t) => (
                    <li key={t} className="flex gap-2 text-[12px] text-white/75 leading-relaxed">
                      <span className="flex-shrink-0" style={{ color: country.color }} aria-hidden>
                        ☐
                      </span>
                      <span>
                        <GlossaryText>{t}</GlossaryText>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        </>
        )}

        {/* ═══════ 탭: 준비 커리큘럼 ═══════ */}
        {topTab === 'curriculum' && (
        <>
        {/* ── 3단계: 생애주기 준비 커리큘럼 (초·중·고 탭 + IB→KB 단계도) ── */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${accent}35` }}>
          <div>
            <h3 className="text-[14px] font-black text-white flex items-center gap-1.5">
              <span aria-hidden>🧭</span>
              생애주기 준비 커리큘럼
            </h3>
            <p className="text-[12px] text-white/70 mt-1 leading-relaxed">
              <GlossaryText>{prepRoadmap.intro}</GlossaryText>
            </p>
          </div>

          {/* 탭 바: 초·중·고 + IB→KB */}
          <div className="grid grid-cols-4 gap-1.5">
            {curriculum.stages.map((s) => {
              const on = curriculumTab === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurriculumTab(s.id)}
                  className="rounded-lg px-1 py-2 text-center transition-all active:scale-[0.97]"
                  style={{ background: on ? `${accent}2a` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${on ? accent : 'rgba(255,255,255,0.12)'}` }}
                  aria-pressed={on}
                >
                  <div className="text-base leading-none mb-0.5" aria-hidden>{s.emoji}</div>
                  <div className="text-[11.5px] font-bold" style={{ color: on ? accent : 'rgba(255,255,255,0.7)' }}>{s.label}</div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCurriculumTab(IB_TAB)}
              className="rounded-lg px-1 py-2 text-center transition-all active:scale-[0.97]"
              style={{ background: curriculumTab === IB_TAB ? `${accent}2a` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${curriculumTab === IB_TAB ? accent : 'rgba(255,255,255,0.12)'}` }}
              aria-pressed={curriculumTab === IB_TAB}
            >
              <div className="text-base leading-none mb-0.5" aria-hidden>{curriculum.ibToKb.emoji}</div>
              <div className="text-[11.5px] font-bold" style={{ color: curriculumTab === IB_TAB ? accent : 'rgba(255,255,255,0.7)' }}>{curriculum.ibToKb.label}</div>
            </button>
          </div>
          <p className="text-[11px] text-white/45 -mt-1">
            <GlossaryText>{curriculum.intro}</GlossaryText>
          </p>

          {/* 탭 내용: 초·중·고 단계 상세 */}
          {activeStage && curriculumTab !== IB_TAB && (
            <div className="rounded-lg p-3 space-y-3" style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}25` }}>
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>{activeStage.emoji}</span>
                <div>
                  <div className="text-[13px] font-black text-white">
                    {activeStage.label}
                    <span className="ml-1.5 text-[11px] font-normal text-white/50">{activeStage.age}</span>
                  </div>
                  <div className="text-[12px]" style={{ color: accent }}>🎯 {activeStage.goal}</div>
                </div>
              </div>

              {/* 5단계 학습 프로세스 */}
              <div>
                <div className="text-[11.5px] font-bold text-white/80 mb-1.5">학습 프로세스</div>
                <div className="space-y-1.5">
                  {activeStage.process.map((p) => (
                    <div key={p.step} className="flex gap-2 text-[12px] leading-relaxed">
                      <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold h-fit" style={{ background: `${accent}22`, color: accent }}>{p.step}</span>
                      <span className="text-white/75"><GlossaryText>{p.detail}</GlossaryText></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 다각도 관점 — 철학·사회학·심리학 */}
              <div>
                <div className="text-[11.5px] font-bold text-white/80 mb-1.5">다각도로 보기 — 왜 지금 이 단계인가</div>
                <div className="space-y-1.5">
                  {activeStage.perspectives.map((pv) => (
                    <div key={pv.lens} className="rounded-md px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}20` }}>
                      <span className="text-[11px] font-bold" style={{ color: accent }}>{pv.emoji} {pv.lens}</span>
                      <span className="text-[12px] text-white/75 leading-relaxed"> — <GlossaryText>{pv.text}</GlossaryText></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 루틴·산출물·연결 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-md px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-[10.5px] text-white/50">🔁 루틴</div>
                  <div className="text-[11.5px] text-white/80 leading-snug">{activeStage.routine}</div>
                </div>
                <div className="rounded-md px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-[10.5px] text-white/50">📦 산출물</div>
                  <div className="text-[11.5px] text-white/80 leading-snug">{activeStage.output}</div>
                </div>
                <div className="rounded-md px-2.5 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-[10.5px] text-white/50">🔗 연결</div>
                  <div className="text-[11.5px] text-white/80 leading-snug">{activeStage.bridge}</div>
                </div>
              </div>
            </div>
          )}

          {/* 탭 내용: IB→KB 생애주기 단계도 */}
          {curriculumTab === IB_TAB && (
            <div className="rounded-lg p-3 space-y-3" style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}25` }}>
              <div>
                <div className="text-[13px] font-black text-white flex items-center gap-1.5">
                  <span aria-hidden>{curriculum.ibToKb.emoji}</span>
                  {curriculum.ibToKb.title}
                </div>
                <p className="text-[12px] text-white/70 mt-1 leading-relaxed">
                  <GlossaryText>{curriculum.ibToKb.intro}</GlossaryText>
                </p>
              </div>

              {/* 단계도 — PYP → MYP → DP → KB (세로 흐름) */}
              <div className="space-y-1">
                {curriculum.ibToKb.stages.map((st, i) => (
                  <div key={st.code}>
                    <div className="rounded-lg px-3 py-2.5" style={{ background: `${st.color}12`, border: `1px solid ${st.color}55` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-black rounded px-2 py-0.5" style={{ background: st.color, color: '#0b1120' }}>{st.code}</span>
                        <span className="text-[12.5px] font-bold text-white">{st.name}</span>
                        <span className="ml-auto text-[10.5px] text-white/50 flex-shrink-0">{st.age}</span>
                      </div>
                      <div className="text-[12px] text-white/80 leading-relaxed"><GlossaryText>{st.focus}</GlossaryText></div>
                      <div className="mt-1 space-y-0.5 text-[11px]">
                        <div className="text-white/60">✍️ 쓰기 — <span className="text-white/80">{st.essay}</span></div>
                        <div className="text-white/60">🏁 마무리 — <span className="text-white/80">{st.capstone}</span></div>
                      </div>
                    </div>
                    {i < curriculum.ibToKb.stages.length - 1 && (
                      <div className="flex justify-center py-0.5 text-white/30 text-base" aria-hidden>↓</div>
                    )}
                  </div>
                ))}
              </div>

              <p className="rounded-lg px-3 py-2 text-[11.5px] leading-relaxed text-white/80" style={{ background: `${accent}12`, border: `1px dashed ${accent}55` }}>
                <GlossaryText>{curriculum.ibToKb.trendNote}</GlossaryText>
              </p>
            </div>
          )}

          <div>
            <SectionTitle emoji="🧩" text="5개국 공통 — 이 다섯 가지 힘" color={accent} />
            <div className="space-y-1.5">
              {prepRoadmap.commonSkills.map((s) => (
                <div key={s.skill} className="flex gap-2 text-[12px] leading-relaxed">
                  <span
                    className="flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold h-fit"
                    style={{ background: `${accent}25`, color: accent }}
                  >
                    {s.skill}
                  </span>
                  <span className="text-white/75">
                    <GlossaryText>{s.how}</GlossaryText>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        </>
        )}

        {/* ═══════ 탭: 관점 연습 ═══════ */}
        {topTab === 'practice' && (
        <>
        {/* ── 4단계: 한 문제, 다른 답안 — 관점별 실전 연습 ── */}
        {multiPerspective && (
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${accent}35` }}>
            <div>
              <h3 className="text-[14px] font-black text-white flex items-center gap-1.5">
                <span aria-hidden>🎭</span>
                {multiPerspective.title}
              </h3>
              <p className="text-[12px] text-white/70 mt-1 leading-relaxed">
                <GlossaryText>{multiPerspective.intro}</GlossaryText>
              </p>
            </div>

            {/* 예시 문제 */}
            <div className="rounded-lg px-3 py-2.5" style={{ background: `${accent}14`, border: `1px solid ${accent}45` }}>
              <div className="text-[10.5px] font-bold text-white/50 mb-0.5">
                예시 문제{multiPerspective.example.source ? ` · ${multiPerspective.example.source}` : ''}
              </div>
              <div className="text-[13px] font-black text-white leading-snug">“{multiPerspective.example.prompt}”</div>
            </div>

            {/* 렌즈별 답안 — 같은 문제, 다른 답 */}
            <div className="space-y-2">
              {multiPerspective.example.lenses.map((l, i) => {
                const c = LENS_COLORS[i % LENS_COLORS.length];
                return (
                  <div key={l.lens} className="rounded-lg px-3 py-2.5" style={{ background: `${c}12`, border: `1px solid ${c}45` }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[13px]" aria-hidden>{l.emoji}</span>
                      <span className="text-[12.5px] font-black" style={{ color: c }}>{l.lens} 관점</span>
                    </div>
                    <div className="text-[12.5px] text-white/90 font-medium leading-relaxed">💬 <GlossaryText>{l.thesis}</GlossaryText></div>
                    <div className="mt-1 text-[11.5px] text-white/60 leading-snug">🔑 근거·개념 — <GlossaryText>{l.basis}</GlossaryText></div>
                    <div className="text-[11.5px] text-white/60 leading-snug">➡️ 결론 — <GlossaryText>{l.conclusion}</GlossaryText></div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-white/50 text-center">
              👆 같은 문제, {multiPerspective.example.lenses.length}개 관점 — 논지도 근거도 결론도 완전히 다릅니다
            </p>

            {/* 다관점 쓰기 훈련법 */}
            <div>
              <SectionTitle emoji="🛠️" text="다관점 쓰기 훈련법" color={accent} />
              <div className="space-y-1.5">
                {multiPerspective.practiceSteps.map((p) => (
                  <div key={p.step} className="flex gap-2 text-[12px] leading-relaxed">
                    <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold h-fit" style={{ background: `${accent}22`, color: accent }}>{p.step}</span>
                    <span className="text-white/75"><GlossaryText>{p.detail}</GlossaryText></span>
                  </div>
                ))}
              </div>
            </div>

            {multiPerspective.tip && (
              <p className="rounded-lg px-3 py-2 text-[11.5px] leading-relaxed text-white/80" style={{ background: `${accent}12`, border: `1px dashed ${accent}55` }}>
                💡 <GlossaryText>{multiPerspective.tip}</GlossaryText>
              </p>
            )}

            {/* 더 연습할 문제 */}
            {multiPerspective.otherPrompts && multiPerspective.otherPrompts.length > 0 && (
              <div>
                <SectionTitle emoji="📝" text="더 연습할 문제 (관점 힌트 포함)" color={accent} />
                <div className="space-y-1.5">
                  {multiPerspective.otherPrompts.map((op) => (
                    <div key={op.prompt} className="rounded-lg px-3 py-2" style={{ background: 'rgba(2,6,23,0.5)', border: `1px solid ${accent}25` }}>
                      <div className="text-[12px] font-bold text-white/90 leading-snug">“{op.prompt}”</div>
                      <div className="text-[11px] text-white/55 mt-0.5 leading-snug">렌즈 힌트 — <GlossaryText>{op.hint}</GlossaryText></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        </>
        )}

        {/* ── 하단 고정: 주의 + 출처 (모든 탭 공통) ── */}
        {/* 주의할 점 */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.28)' }}>
          <SectionTitle emoji="⚠️" text="꼭 기억할 것" color="#FCA5A5" />
          <ul className="space-y-1">
            {cautions.map((c) => (
              <li key={c} className="flex gap-2 text-[12px] text-amber-100/85 leading-relaxed">
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

        {/* 출처 */}
        {sources && sources.length > 0 && (
          <details className="rounded-xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.5)', border: `1px solid ${accent}25` }}>
            <summary className="cursor-pointer select-none list-none marker:text-transparent px-4 py-2.5 text-[12px] font-bold text-white/80 hover:bg-white/[0.03]">
              🔗 출처 · 근거 자료 ({sources.length})
            </summary>
            <div className="px-4 pb-3 space-y-1.5 border-t" style={{ borderColor: `${accent}20` }}>
              {sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 pt-2 text-[11.5px] text-sky-300/85 hover:text-sky-200 leading-snug"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
