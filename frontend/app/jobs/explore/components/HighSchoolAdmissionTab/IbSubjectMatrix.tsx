'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import ibData from '@/data/high-school/ib.json';
import type { HighSchoolDetail } from '../../types';

/* ────────────────────────────────────────────────────────────────
 * IB 카테고리 전용 — DP 6개 과목군 × 이어지는 대학 전공 지도.
 * 직업계고의 "전공 계열"에 해당하는 축이 IB에서는 학과가 아니라
 * ==과목군(HL 3과목 선택)==이다. 과목군을 누르면 대표 과목·연결 전공과
 * 그 과목군을 확인해야 할 학교 목록이 팝업으로 열린다.
 * 학교별 개설 과목은 IBO도 공개하지 않으므로 단정하지 않고,
 * 검증 가능한 트랙(한국어/영어 DP·PYP·MYP 연계·후보학교)만 뱃지로 붙인다.
 * ──────────────────────────────────────────────────────────────── */

type SubjectGroup = {
  id: string;
  emoji: string;
  label: string;
  what: string;
  subjects: string[];
  majors: string[];
  tip: string;
};

type CoreItem = { id: string; emoji: string; label: string; what: string; why: string };

type DpSubjectGroups = {
  headline: string;
  intro: string;
  scoreNote: string;
  groups: SubjectGroup[];
  core: CoreItem[];
  checkBeforeApply: string[];
  sourceNote: string;
};

const dp = (ibData as { dpSubjectGroups?: DpSubjectGroups }).dpSubjectGroups;

/** ==형광펜== 구문을 그대로 살려 강조 */
function Mark({ text, color }: { text: string; color: string }) {
  const parts = text.split(/==([^=]+)==/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <b key={i} style={{ color }}>
            {p}
          </b>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export function IbSubjectMatrix({
  categoryId,
  schools,
  color,
  bgColor,
  onSelectSchool,
}: {
  categoryId: string;
  schools: HighSchoolDetail[];
  color: string;
  bgColor: string;
  onSelectSchool?: (school: HighSchoolDetail) => void;
}) {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [hoverSchoolId, setHoverSchoolId] = useState<string | null>(null);

  if (categoryId !== 'ib' || !dp) return null;

  const openGroup = dp.groups.find((g) => g.id === openGroupId);

  // 학교는 수업 언어 트랙으로 묶는다 — 학습 부담과 대입 트랙이 여기서 갈린다
  const TRACKS = ['한국어 DP', '한국어·영어 이중언어 DP', '영어 DP'] as const;
  const trackOf = (s: HighSchoolDetail) =>
    TRACKS.find((t) => (s.ibTrackTags ?? []).includes(t)) ?? '트랙 미확인';

  const grouped = [...TRACKS, '트랙 미확인'].map((t) => ({
    track: t,
    items: schools.filter((s) => trackOf(s) === t),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color }}>
        {dp.headline}
      </p>
      <p className="text-[12px] text-gray-400 leading-relaxed -mt-1.5 mb-1">
        <Mark text={dp.intro} color={color} />
      </p>
      <p className="text-[12px] text-gray-400 leading-relaxed mb-1">
        <Mark text={dp.scoreNote} color={color} />
      </p>

      {/* ── 과목군 × 연결 전공 표 ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}33` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr style={{ background: `${color}18` }}>
                {/* 모바일에서는 과목군 열 폭을 좁혀 대표 과목 쪽에 폭을 넘김 */}
                <th className="text-left px-2 sm:px-3 py-2 font-bold w-[84px] sm:w-auto whitespace-normal sm:whitespace-nowrap" style={{ color }}>
                  과목군
                </th>
                <th className="text-left px-3 py-2 font-bold" style={{ color }}>
                  대표 과목
                </th>
                <th className="text-left px-3 py-2 font-bold whitespace-nowrap" style={{ color }}>
                  이어지는 전공
                </th>
              </tr>
            </thead>
            <tbody>
              {dp.groups.map((g) => (
                <tr
                  key={g.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-white/10"
                  onClick={() => setOpenGroupId(g.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenGroupId(g.id);
                    }
                  }}
                  style={{ borderTop: `1px solid ${color}1f` }}
                >
                  <td className="px-2 sm:px-3 py-2 text-gray-100 align-top w-[84px] sm:w-auto whitespace-normal sm:whitespace-nowrap break-keep">
                    {g.emoji} {g.label.replace(/^군\d+\s*·\s*/, '').replace(/\s*\(.*\)$/, '')}
                  </td>
                  <td className="px-3 py-2 text-gray-400 align-top">{g.subjects.slice(0, 3).join(' · ')}</td>
                  <td className="px-3 py-2 align-top" style={{ color }}>
                    {g.majors.slice(0, 2).join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        과목군을 누르면 <b>HL 선택이 어느 전공으로 이어지는지</b>와 <b>지원 전 확인할 것</b>이 열립니다.
      </p>

      {/* ── 코어 3종 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
        {dp.core.map((c) => (
          <div
            key={c.id}
            className="rounded-xl px-3 py-2.5"
            style={{ background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${color}22` }}
          >
            <p className="text-[12.5px] font-bold" style={{ color }}>
              {c.emoji} {c.label}
            </p>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{c.what}</p>
            <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
              <Mark text={c.why} color={color} />
            </p>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        <Mark text={dp.sourceNote} color={color} />
      </p>

      {/* ── 과목군 팝업 ── */}
      {openGroup && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 p-3"
          onClick={() => setOpenGroupId(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-5xl h-[92vh] sm:h-[90vh] rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#0b1020', border: `1px solid ${color}44` }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${openGroup.label} 안내`}
          >
            <div
              className="px-4 py-3 flex items-start justify-between gap-3"
              style={{ background: `${color}18`, borderBottom: `1px solid ${color}33` }}
            >
              <div>
                <p className="text-[14px] font-bold text-gray-100">
                  {openGroup.emoji} {openGroup.label}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">
                  <Mark text={openGroup.what} color={color} />
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpenGroupId(null)}
                aria-label="닫기"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/10 shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22` }}>
                  <p className="text-[12px] font-bold mb-1.5" style={{ color }}>개설 과목 (IBO 표준)</p>
                  <div className="flex flex-wrap gap-1">
                    {openGroup.subjects.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold leading-none"
                        style={{ background: `${color}22`, color, border: `1px solid ${color}55` }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22` }}>
                  <p className="text-[12px] font-bold mb-1.5" style={{ color }}>이어지는 대학 전공</p>
                  <div className="flex flex-wrap gap-1">
                    {openGroup.majors.map((m) => (
                      <span
                        key={m}
                        className="px-1.5 py-0.5 rounded-md text-[10.5px] font-semibold leading-none text-gray-200"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-gray-300 leading-relaxed">
                <Mark text={openGroup.tip} color={color} />
              </p>

              <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <p className="text-[12px] font-bold text-gray-200 mb-1.5">🔎 지원 전 학교에 물어볼 것</p>
                <ul className="space-y-1">
                  {dp.checkBeforeApply.map((c) => (
                    <li key={c} className="text-[11.5px] text-gray-400 leading-relaxed">
                      · <Mark text={c} color={color} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* 학교 목록 — 수업 언어 트랙별 */}
              {grouped.map((g) => (
                <div key={g.track}>
                  <p className="text-[12px] font-bold mb-1.5" style={{ color }}>
                    {g.track} {g.items.length}교
                    <span className="text-gray-500 font-normal"> · 학교를 누르면 상세로 이동합니다</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {g.items.map((school) => {
                      const inner = (
                        <>
                          <span className="block text-[12.5px] font-semibold text-gray-100">
                            {school.emoji} {school.shortName ?? school.name}
                          </span>
                          <span className="flex flex-wrap gap-1 mt-1">
                            {(school.ibTrackTags ?? []).map((t) => (
                              <span
                                key={t}
                                className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold leading-none"
                                style={{
                                  background: hoverSchoolId === school.id ? color : `${color}22`,
                                  color: hoverSchoolId === school.id ? '#0b1020' : color,
                                  border: `1px solid ${color}55`,
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </span>
                          <span className="block text-[10px] text-gray-500 mt-1">{school.location}</span>
                        </>
                      );
                      if (onSelectSchool) {
                        return (
                          <button
                            key={school.id}
                            type="button"
                            onClick={() => {
                              setOpenGroupId(null);
                              onSelectSchool(school);
                            }}
                            onMouseEnter={() => setHoverSchoolId(school.id)}
                            onMouseLeave={() => setHoverSchoolId((prev) => (prev === school.id ? null : prev))}
                            onFocus={() => setHoverSchoolId(school.id)}
                            onBlur={() => setHoverSchoolId((prev) => (prev === school.id ? null : prev))}
                            className="px-2.5 py-2 rounded-xl text-left transition-all duration-150 outline-none"
                            style={
                              hoverSchoolId === school.id
                                ? {
                                    background: `${color}26`,
                                    border: `1px solid ${color}`,
                                    boxShadow: `0 0 0 2px ${color}33, 0 6px 18px ${color}30`,
                                    transform: 'translateY(-2px)',
                                  }
                                : { background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}33`, boxShadow: 'none' }
                            }
                          >
                            {inner}
                          </button>
                        );
                      }
                      return school.websiteUrl ? (
                        <a
                          key={school.id}
                          href={school.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-2 rounded-xl block transition-colors hover:bg-white/10"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          {inner}
                          <span className="block text-[10px] text-gray-400 mt-0.5">학교 홈페이지 ↗</span>
                        </a>
                      ) : (
                        <div
                          key={school.id}
                          className="px-2.5 py-2 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          {inner}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
