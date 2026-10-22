'use client';

import { useMemo, useState } from 'react';
import type { SchoolCampHostType, SchoolCampProgram } from '../../types';
import { GlossaryText } from '../UniversityAdmissionTab/GlossaryText';

const HOST_META: Record<SchoolCampHostType, { label: string; emoji: string; color: string }> = {
  highschool: { label: '고등학교', emoji: '🏫', color: '#f472b6' },
  university: { label: '대학교', emoji: '🎓', color: '#a78bfa' },
  institute: { label: '공공·연구기관', emoji: '🏛️', color: '#38bdf8' },
  government: { label: '정부·지자체', emoji: '🏙️', color: '#34d399' },
  company: { label: '기업', emoji: '🏢', color: '#fbbf24' },
};

const HOST_ORDER: SchoolCampHostType[] = ['highschool', 'university', 'institute', 'government', 'company'];
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const YEAR_ROUND = 0;

function monthLabel(p: SchoolCampProgram) {
  if (p.yearRound) return '연중';
  if (p.months.length === 0) return '수시 · 공고 확인';
  return `${p.months.join('·')}월`;
}

function isAfterAdmission(stage: string) {
  return stage.includes('입학 후');
}

const APPLY_KIND_LABEL: Record<NonNullable<SchoolCampProgram['applyKind']>, string> = {
  apply: '바로 신청',
  notice: '모집 공고',
  program: '프로그램 안내',
  school: '학교 단위 신청',
  homepage: '기관 홈페이지',
};

/** 기사(무슨 프로그램인지) · 접수처(어디서 신청하는지) 두 링크 */
function CampLinks({ program: p, accentColor }: { program: SchoolCampProgram; accentColor: string }) {
  const articleUrl = p.articleUrl ?? p.sourceUrl;
  const applyUrl = p.applyUrl ?? p.url;
  if (!articleUrl && !applyUrl && !p.checked) return null;
  const kind = p.applyKind ? APPLY_KIND_LABEL[p.applyKind] : null;
  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex flex-col sm:flex-row gap-1.5">
        {applyUrl && (
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}70` }}
          >
            <span className="block">📝 접수처{kind ? ` · ${kind}` : ''} ↗</span>
            {p.applyLabel && <span className="block text-[10px] font-bold text-gray-300 truncate">{p.applyLabel}</span>}
          </a>
        )}
        {articleUrl && (
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-0 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold text-sky-300 bg-sky-400/10 border border-sky-400/30"
          >
            <span className="block">📰 기사 보기 ↗</span>
            {p.articleTitle && <span className="block text-[10px] font-bold text-gray-300 truncate">{p.articleTitle}</span>}
          </a>
        )}
      </div>
      {p.checked && <p className="text-[10px] text-gray-500">✔ {p.checked}</p>}
    </div>
  );
}

type Props = {
  programs: SchoolCampProgram[];
  accentColor: string;
};

export function CampScheduleSection({ programs, accentColor }: Props) {
  const [month, setMonth] = useState<number | null>(null);
  const [host, setHost] = useState<SchoolCampHostType | null>(null);

  const monthCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const p of programs) {
      if (host && p.hostType !== host) continue;
      if (p.yearRound || p.months.length === 0) {
        counts.set(YEAR_ROUND, (counts.get(YEAR_ROUND) ?? 0) + 1);
      } else {
        for (const m of p.months) counts.set(m, (counts.get(m) ?? 0) + 1);
      }
    }
    return counts;
  }, [programs, host]);

  const hostCounts = useMemo(() => {
    const counts = new Map<SchoolCampHostType, number>();
    for (const p of programs) counts.set(p.hostType, (counts.get(p.hostType) ?? 0) + 1);
    return counts;
  }, [programs]);

  const visible = programs.filter((p) => {
    if (host && p.hostType !== host) return false;
    if (month === null) return true;
    if (month === YEAR_ROUND) return !!p.yearRound || p.months.length === 0;
    return p.months.includes(month);
  });

  const chipStyle = (active: boolean, color: string) => ({
    backgroundColor: active ? `${color}30` : 'rgba(255,255,255,0.04)',
    color: active ? color : '#9ca3af',
    border: `1px solid ${active ? `${color}80` : 'rgba(255,255,255,0.08)'}`,
  });

  return (
    <section
      className="rounded-2xl p-3 space-y-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${accentColor}35` }}
    >
      <div>
        <p className="text-[13px] font-extrabold" style={{ color: accentColor }}>
          🏕️ 캠프·교육 일정표 <span className="text-gray-400 font-bold">· {programs.length}개</span>
        </p>
        <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
          고등학교·대학교·연구기관·지자체·기업이 실제로 여는 프로그램이에요. 달을 누르면 그 달에 열리거나 모집하는 것만 보여요.
        </p>
      </div>

      {/* 주최 유형 필터 */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setHost(null)}
          className="px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={chipStyle(host === null, accentColor)}
        >
          전체
        </button>
        {HOST_ORDER.filter((h) => hostCounts.get(h)).map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHost(host === h ? null : h)}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={chipStyle(host === h, HOST_META[h].color)}
          >
            {HOST_META[h].emoji} {HOST_META[h].label} {hostCounts.get(h)}
          </button>
        ))}
      </div>

      {/* 12개월 달력 */}
      <div className="grid grid-cols-7 gap-1">
        <button
          type="button"
          onClick={() => setMonth(month === YEAR_ROUND ? null : YEAR_ROUND)}
          className="rounded-lg py-1.5 text-center"
          style={chipStyle(month === YEAR_ROUND, accentColor)}
        >
          <span className="block text-[11px] font-extrabold">수시</span>
          <span className="block text-[10px]">{monthCounts.get(YEAR_ROUND) ?? 0}</span>
        </button>
        {MONTHS.map((m) => {
          const n = monthCounts.get(m) ?? 0;
          const isVacation = m === 1 || m === 2 || m === 7 || m === 8;
          return (
            <button
              key={m}
              type="button"
              disabled={n === 0}
              onClick={() => setMonth(month === m ? null : m)}
              className="rounded-lg py-1.5 text-center disabled:opacity-30"
              style={chipStyle(month === m, accentColor)}
              title={isVacation ? '방학' : undefined}
            >
              <span className="block text-[11px] font-extrabold">
                {m}월{isVacation ? '☀️' : ''}
              </span>
              <span className="block text-[10px]">{n}</span>
            </button>
          );
        })}
      </div>

      {/* 프로그램 목록 (1열) */}
      <ul className="space-y-2">
        {visible.map((p) => {
          const meta = HOST_META[p.hostType];
          const after = isAfterAdmission(p.stage);
          return (
            <li
              key={p.id}
              className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.04)', borderLeft: `3px solid ${meta.color}` }}
            >
              <div className="flex flex-wrap items-center gap-1 mb-1.5">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                  style={{ backgroundColor: `${meta.color}25`, color: meta.color, border: `1px solid ${meta.color}60` }}
                >
                  {meta.emoji} {meta.label}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                  style={
                    after
                      ? { backgroundColor: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: '1px solid rgba(148,163,184,0.4)' }
                      : { backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}60` }
                  }
                >
                  {after ? '🎒 입학 후 도전' : `🎯 ${p.stage}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-300 bg-white/5 border border-white/10">
                  📅 {monthLabel(p)}
                </span>
                {p.cost.includes('무료') || p.cost.includes('전액') ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/30">
                    💸 {p.cost.includes('전액') ? '전액 지원' : '무료'}
                  </span>
                ) : null}
              </div>

              <p className="text-[13px] font-extrabold text-gray-100 leading-snug">{p.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {p.host} · {p.region}
              </p>

              <p className="text-xs text-gray-300 leading-relaxed mt-2">
                <GlossaryText>{p.intro}</GlossaryText>
              </p>

              <dl className="mt-2 space-y-1 text-[11px] leading-relaxed">
                <div className="flex gap-2">
                  <dt className="text-gray-500 flex-shrink-0 w-10">일정</dt>
                  <dd className="text-gray-200"><GlossaryText>{p.schedule}</GlossaryText></dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 flex-shrink-0 w-10">대상</dt>
                  <dd className="text-gray-200"><GlossaryText>{p.target}</GlossaryText></dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 flex-shrink-0 w-10">비용</dt>
                  <dd className="text-gray-200"><GlossaryText>{p.cost}</GlossaryText></dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-gray-500 flex-shrink-0 w-10">신청</dt>
                  <dd className="text-gray-200"><GlossaryText>{p.howToApply}</GlossaryText></dd>
                </div>
              </dl>

              <CampLinks program={p} accentColor={accentColor} />
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="text-xs text-gray-500 text-center py-4">이 조건에 맞는 프로그램이 없어요.</li>
        )}
      </ul>

      <p className="text-[10px] text-gray-500 leading-relaxed">
        일정은 최근 운영 기준이라 해마다 바뀔 수 있어요. 신청 전에 공식 공지를 꼭 확인하세요.
      </p>
    </section>
  );
}
