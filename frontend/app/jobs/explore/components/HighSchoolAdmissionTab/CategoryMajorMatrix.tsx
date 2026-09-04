'use client';

import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import meisterData from '@/data/high-school/meister.json';
import specializedData from '@/data/high-school/specialized.json';
import businessData from '@/data/high-school/business.json';
import metroMapData from '@/data/high-school/metro-school-map.json';
import { HIGH_SCHOOL_LABELS } from '../../config';
import type { HighSchoolDetail } from '../../types';

/* ────────────────────────────────────────────────────────────────
 * 직업계고 3유형(마이스터·특성화·비즈니스)을 ==전공 계열== 하나의 축으로
 * 세워 비교하는 섹션. 유형별로 흩어져 있던 학과를 같은 기준으로 묶어
 * "이 전공은 어느 유형에 몇 개교가 있는가"를 한 화면에서 보여준다.
 * 분류 근거는 학교 카드에 이미 등록된 값(listTags·마이스터 지정 분야·
 * 수도권 지도의 학과 목록)만 사용한다 — 추정하지 않는다.
 * ──────────────────────────────────────────────────────────────── */

/** 이 섹션을 노출할 직업계고 3유형 */
const VOCATIONAL_CATEGORY_IDS = ['meister', 'specialized', 'business'] as const;
export type VocationalCategoryId = (typeof VOCATIONAL_CATEGORY_IDS)[number];

const CATEGORY_LABEL: Record<VocationalCategoryId, string> = {
  meister: '마이스터고',
  specialized: '특성화고',
  business: '비즈니스고',
};

const CATEGORY_SHORT: Record<VocationalCategoryId, string> = {
  meister: '마이스터',
  specialized: '특성화',
  business: '비즈니스',
};

export function isVocationalCategory(id: string): id is VocationalCategoryId {
  return (VOCATIONAL_CATEGORY_IDS as readonly string[]).includes(id);
}

type MajorTrack = {
  id: string;
  emoji: string;
  label: string;
  /** 이 계열이 실제로 무엇을 배우고 어디로 가는지 — 학과명만으로는 안 보이는 부분 */
  hint: string;
  match: RegExp;
};

/** 전공 계열 — 학과명 키워드로 묶는다. 한 학교가 여러 계열에 걸칠 수 있다. */
const MAJOR_TRACKS: MajorTrack[] = [
  { id: 'semi', emoji: '💾', label: '반도체·디스플레이', hint: '공정·장비·품질 직무. 대기업 생산기술직 채용이 가장 두꺼운 계열', match: /반도체|디스플레이|나노|웨이퍼/ },
  { id: 'elec', emoji: '📡', label: '전자·통신·IoT', hint: '회로·통신설비·임베디드. 전자기기 제조와 통신망 유지보수로 갈린다', match: /전자|통신|정보통신|IoT|사물인터넷|임베디드|전파/ },
  { id: 'sw', emoji: '💻', label: '소프트웨어·AI·정보보안', hint: '개발·데이터·보안. 3유형 중 대학 진학 비중이 가장 높은 계열', match: /소프트웨어|SW|\bIT\b|프로그래밍|정보처리|인공지능|\bAI\b|AI데이터|데이터|빅데이터|정보보호|보안|네트워크|클라우드|웹|앱|모바일|디지털/ },
  { id: 'mech', emoji: '⚙️', label: '기계·금속·정밀가공', hint: '선반·밀링·CNC·용접. 자격증이 곧 채용 조건인 대표적 계열', match: /기계|금속|정밀|기계가공|절삭가공|선반|밀링|CNC|용접|메카트로닉스|제철|철강|주조|금형/ },
  { id: 'auto', emoji: '🤖', label: '로봇·자동화·스마트팩토리', hint: 'PLC·센서·설비 제어. 공장 자동화 설비 보전 직무로 이어진다', match: /로봇|자동화|자동제어|제어|PLC|스마트팩토리|스마트공장|생산자동화|설비/ },
  { id: 'car', emoji: '🚗', label: '자동차·모빌리티', hint: '정비·부품·전동화. 완성차와 부품사 생산직이 주 트랙', match: /자동차|모빌리티|차량/ },
  { id: 'marine', emoji: '🚢', label: '조선·해양·항공·드론', hint: '선박·항해·기관·항공정비. 승선·자격 요건이 별도로 붙는다', match: /조선|해양|항해|해기|선박|항공|우주|드론|해사|수산/ },
  { id: 'energy', emoji: '⚡', label: '전기·에너지·환경', hint: '전기설비·발전·신재생. 전기기능사 계열 자격이 축', match: /전기|에너지|발전|원자력|전력|신재생|전지|배터리|환경|기후|탄소/ },
  { id: 'build', emoji: '🏗️', label: '건설·건축·플랜트·인테리어', hint: '시공·설비·도면. 현장 경력이 자격보다 빨리 쌓이는 계열', match: /건설|건축|토목|플랜트|인테리어|배관|공조/ },
  { id: 'chem', emoji: '🧪', label: '화공·바이오·제약', hint: '공정 관리·품질 분석. 제약·화학 대기업 생산직 연계', match: /화공|화학|바이오|제약|생명공학|생명과학|의약|신소재/ },
  { id: 'agri', emoji: '🌱', label: '농생명·스마트팜·반려동물', hint: 'ICT 시설원예·축산·반려동물 산업. 창업 비중이 높다', match: /농업|농생명|원예|스마트팜|축산|반려동물|말 ?산업|경마|산림|조경|생명과학과/ },
  { id: 'food', emoji: '🍳', label: '식품·조리·외식', hint: '식품 제조 공정과 조리는 진로가 다르다 — 공장이냐 주방이냐', match: /식품|조리|외식|제과|제빵|한식|양식|베이커리|푸드/ },
  { id: 'safety', emoji: '🚒', label: '소방·안전·산업보건', hint: '소방설비·구조구급. 체력 요건과 공무원(소방) 시험이 따로 붙는다', match: /소방|안전|재난|구조·구급|산업보건/ },
  { id: 'health', emoji: '🏥', label: '보건·간호·복지', hint: '간호조무·보건행정. 면허·자격 취득 시기가 진로를 가른다', match: /보건|간호|의료|치위생|복지|요양/ },
  { id: 'design', emoji: '🎨', label: '디자인·패션·뷰티·공예', hint: '포트폴리오가 자격증보다 강한 계열', match: /디자인|패션|의상|주얼리|공예|뷰티|미용|헤어|메이크업/ },
  { id: 'media', emoji: '🎬', label: '미디어·콘텐츠·게임', hint: '영상·애니·웹툰·게임. 만든 결과물로 뽑힌다', match: /미디어|영상|방송|애니메이션|콘텐츠|만화|웹툰|게임|음악|공연|엔터/ },
  { id: 'finance', emoji: '🏦', label: '금융·회계·세무', hint: '전산회계·FAT/TAT·은행 채용. 비즈니스고의 중심 계열', match: /금융|회계|세무|관세|재무|은행|경리|전산회계/ },
  { id: 'biz', emoji: '💼', label: '경영·사무·창업', hint: '사무행정·창업. 공기업 사무직 고졸 채용과 이어진다', match: /경영|사무|비서|창업|e비즈니스|비즈니스|행정/ },
  { id: 'trade', emoji: '📣', label: '마케팅·유통·물류', hint: '판매·물류관리·이커머스. 현장 실습 비중이 높다', match: /마케팅|유통|물류|판매|커머스|배송/ },
  { id: 'global', emoji: '🌏', label: '국제통상·무역·외국어', hint: '무역 실무 + 어학. 항공·호텔 서비스로도 연결된다', match: /국제|통상|무역|외국어|글로벌/ },
  { id: 'tour', emoji: '🧳', label: '관광·호텔·컨벤션', hint: '서비스 직무. 어학 성적이 채용을 가른다', match: /관광|호텔|컨벤션|이벤트|항공서비스|승무/ },
];

/* ── 학교 → 학과 텍스트 ─────────────────────────────────────────
 * 근거 있는 필드만 이어 붙인다. description 같은 서술형은 우연히 걸리는
 * 단어가 많아 제외하고, 학과·지정분야·태그만 본다. */

type MetroPin = { schoolId?: string; depts?: string[] };
const metroPinDepts: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {};
  const categories = (metroMapData as { categories: Record<string, { pins: MetroPin[] }> }).categories;
  for (const key of Object.keys(categories)) {
    for (const pin of categories[key].pins ?? []) {
      if (pin.schoolId && pin.depts?.length) out[pin.schoolId] = pin.depts;
    }
  }
  return out;
})();

/** 지정 분야·중점을 적어 둔 문자열만 계열 근거로 인정한다 (자격증 나열은 제외) */
function fieldCert(school: HighSchoolDetail): string {
  const cert = school.specialCertification;
  if (typeof cert !== 'string') return '';
  return /마이스터 분야|중점/.test(cert) ? cert : '';
}

function majorText(school: HighSchoolDetail): string {
  return [
    ...(school.departments ?? []),
    ...(school.listTags ?? []),
    // 교명 자체가 계열을 밝히는 학교가 있다 (게임과학고·뷰티고 등)
    school.name ?? '',
    // 마이스터 지정 분야·비즈니스 중점처럼 "분야"를 적은 문자열만 쓴다.
    // 자격증 나열(배열이거나 "○○기능사 …" 문자열)은 학과가 아니라 계열 근거가 못 된다.
    fieldCert(school),
    school.type ?? '',
    ...(metroPinDepts[school.id] ?? []),
  ].join(' ');
}

/** 이 학교가 그 계열에서 실제로 개설한 학과·중점 — 뱃지로 보여줄 문자열들 */
function matchedBadges(school: HighSchoolDetail, track: MajorTrack): string[] {
  const clean = (t: string) =>
    t
      .replace(/^[^\s가-힣A-Za-z]+\s*/, '') // 앞머리 이모지 제거
      .replace(/\s*특화$/, '')
      .trim();

  // 학과가 등록된 학교는 학과명만 쓴다. 태그("🏦 금융·회계 특화")까지 같이 넣으면
  // 학과 뱃지 옆에 같은 뜻의 계열 뱃지가 중복으로 붙는다.
  const departments = [...(school.departments ?? []), ...(metroPinDepts[school.id] ?? [])];
  const source = departments.length ? departments : (school.listTags ?? []);
  const badges = source
    .filter((t) => track.match.test(t))
    .map(clean)
    .filter(Boolean);

  const cert = departments.length ? '' : fieldCert(school);
  if (cert && track.match.test(cert)) {
    badges.push(cert.replace(/^교육부 지정 마이스터 분야\s*·\s*/, '').replace(/^.*—\s*/, '').replace(/\s*중점 특성화고$/, '').trim());
  }

  const unique = [...new Set(badges.map(clean).filter(Boolean))]
    // 태그 중에는 학과명이 아니라 연혁·설명을 통째로 넣어 둔 것도 있다.
    // 뱃지는 한 눈에 읽히는 길이여야 하므로 문장형은 버린다.
    .filter((t) => t.length <= 16 && !/[.。]|==|,|\s—\s/.test(t));
  // 근거 문자열이 학교 카드에 없으면 최소한 계열명이라도 붙여 준다
  return (unique.length ? unique : [track.label]).slice(0, 3);
}

/** 입학 난이도 — 학교 카드·상세와 같은 5단계 점 표기 */
function DifficultyMark({ level, color }: { level: number; color: string }) {
  if (!level) return null;
  const label = HIGH_SCHOOL_LABELS.school_difficulty_levels[String(level)] ?? '';
  return (
    <span className="flex items-center gap-1 shrink-0" title={`입학 난이도 ${level}/5 · ${label}`}>
      <span className="flex gap-[2px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="rounded-full"
            style={{
              width: 5,
              height: 5,
              background: i < level ? color : 'rgba(255,255,255,0.18)',
            }}
          />
        ))}
      </span>
      <span className="text-[9.5px] text-gray-500 leading-none">{label}</span>
    </span>
  );
}

type TrackRow = {
  track: MajorTrack;
  counts: Record<VocationalCategoryId, number>;
  total: number;
  current: HighSchoolDetail[];
};

const ALL_SCHOOLS: Record<VocationalCategoryId, HighSchoolDetail[]> = {
  meister: (meisterData as { schools: HighSchoolDetail[] }).schools,
  specialized: (specializedData as { schools: HighSchoolDetail[] }).schools,
  business: (businessData as { schools: HighSchoolDetail[] }).schools,
};

export function CategoryMajorMatrix({
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
  // 계열을 누르면 학교 명단이 팝업으로 열리고, 팝업에서 학교를 누르면 상세로 들어간다.
  const [dialogTrackId, setDialogTrackId] = useState<string | null>(null);
  // 팝업 안에서 펼쳐 둔 유형. 기본값은 지금 보고 있는 유형.
  const [openTypeId, setOpenTypeId] = useState<string | null>(null);
  // 마우스를 올린(또는 키보드 포커스된) 학교 — 하이라이트 대상
  const [hoverSchoolId, setHoverSchoolId] = useState<string | null>(null);

  const rows = useMemo<TrackRow[]>(() => {
    if (!isVocationalCategory(categoryId)) return [];
    return MAJOR_TRACKS.map((track) => {
      const counts = {
        meister: 0,
        specialized: 0,
        business: 0,
      } as Record<VocationalCategoryId, number>;
      for (const key of VOCATIONAL_CATEGORY_IDS) {
        counts[key] = ALL_SCHOOLS[key].filter((s) => track.match.test(majorText(s))).length;
      }
      const current = schools.filter((s) => track.match.test(majorText(s)));
      return { track, counts, total: counts.meister + counts.specialized + counts.business, current };
    })
      .filter((r) => r.total > 0)
      .sort((a, b) => b.current.length - a.current.length || b.total - a.total);
  }, [categoryId, schools]);

  if (!isVocationalCategory(categoryId) || rows.length === 0) return null;

  const activeId = categoryId;
  const uncategorized = schools.filter((s) => !MAJOR_TRACKS.some((t) => t.match.test(majorText(s))));
  const dialogRow = rows.find((r) => r.track.id === dialogTrackId);

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color }}>
        🧩 전공 계열로 한눈에 — 직업계고 3유형 비교
      </p>
      <p className="text-[12px] text-gray-400 leading-relaxed -mt-1.5 mb-1">
        같은 전공이라도 <b style={{ color }}>마이스터고는 전기 전형·전원 기숙·취업 우선</b>,
        <b style={{ color }}> 특성화고는 후기 전형·통학·진학 병행</b>,
        <b style={{ color }}> 비즈니스고는 사무·금융 직군</b>으로 갈립니다.
        <b> 계열 줄을 누르면 학교 명단이 뜹니다.</b> 숫자는 이 앱에 등록된 학교 기준이고, 한 학교가 여러 계열에 걸치면 중복 집계됩니다.
      </p>

      {/* ── 계열 × 유형 교차표 ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}33` }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] border-collapse">
            <thead>
              <tr style={{ background: `${color}18` }}>
                <th className="text-left px-3 py-2 font-bold" style={{ color }}>전공 계열</th>
                {VOCATIONAL_CATEGORY_IDS.map((id) => (
                  <th
                    key={id}
                    className="px-2 py-2 font-bold whitespace-nowrap text-center"
                    style={{ color: id === activeId ? color : '#9ca3af' }}
                  >
                    {CATEGORY_SHORT[id]}
                    {id === activeId && ' ●'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.track.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-white/10"
                  onClick={() => {
                    setOpenTypeId(null);
                    setDialogTrackId(r.track.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setOpenTypeId(null);
                      setDialogTrackId(r.track.id);
                    }
                  }}
                  style={{ borderTop: `1px solid ${color}1f` }}
                >
                  <td className="px-3 py-2 text-gray-100 whitespace-nowrap">
                    {r.track.emoji} {r.track.label}
                  </td>
                  {VOCATIONAL_CATEGORY_IDS.map((id) => (
                    <td
                      key={id}
                      className="px-2 py-2 text-center tabular-nums"
                      style={{
                        color: r.counts[id] === 0 ? '#4b5563' : id === activeId ? color : '#d1d5db',
                        fontWeight: id === activeId && r.counts[id] > 0 ? 700 : 400,
                        background: id === activeId ? `${color}0f` : undefined,
                      }}
                    >
                      {r.counts[id] || '–'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {uncategorized.length > 0 && (
        <p className="text-[11px] text-gray-500 leading-relaxed">
          학과 정보가 아직 등록되지 않아 계열이 잡히지 않은 학교 {uncategorized.length}교
          ({uncategorized.slice(0, 5).map((s) => s.shortName ?? s.name).join(' · ')}
          {uncategorized.length > 5 ? ' 외' : ''}) — 학교 카드에서 학과를 직접 확인하세요.
        </p>
      )}

      {/* ── 계열별 학교 명단 팝업 ── */}
      {dialogRow && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/60 p-3"
          onClick={() => setDialogTrackId(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-5xl h-[92vh] sm:h-[90vh] rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#0b1020', border: `1px solid ${color}44` }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${dialogRow.track.label} 계열 학교 명단`}
          >
            <div className="px-4 py-3 flex items-start justify-between gap-3" style={{ background: `${color}18`, borderBottom: `1px solid ${color}33` }}>
              <div>
                <p className="text-[14px] font-bold text-gray-100">
                  {dialogRow.track.emoji} {dialogRow.track.label}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{dialogRow.track.hint}</p>
              </div>
              <button
                type="button"
                onClick={() => setDialogTrackId(null)}
                aria-label="닫기"
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-100 hover:bg-white/10 shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* 유형별 아코디언 — 한 번에 한 유형만 펼친다. 학교가 37교까지 가는
                비즈니스고 때문에 전부 펼쳐두면 명단이 화면을 덮는다. */}
            <div className="overflow-y-auto px-4 py-3 space-y-2">
              {VOCATIONAL_CATEGORY_IDS.filter((id) => id === activeId || dialogRow.counts[id] > 0).map((id) => {
                const isCurrent = id === activeId;
                const list = isCurrent
                  ? dialogRow.current
                  : ALL_SCHOOLS[id].filter((s) => dialogRow.track.match.test(majorText(s)));
                const open = (openTypeId ?? activeId) === id;
                return (
                  <div
                    key={id}
                    className="rounded-xl overflow-hidden"
                    style={{ border: `1px solid ${isCurrent ? `${color}44` : 'rgba(255,255,255,0.10)'}` }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenTypeId(open ? 'none' : id)}
                      className="w-full px-3.5 py-2.5 text-left"
                      style={{ background: isCurrent ? `${color}14` : 'rgba(255,255,255,0.03)' }}
                    >
                      <p className="text-[12.5px] font-bold flex items-center justify-between gap-2" style={{ color: isCurrent ? color : '#d1d5db' }}>
                        <span>
                          {CATEGORY_LABEL[id]} {list.length}교
                          {isCurrent && <span className="text-gray-500 font-normal"> · 지금 보는 유형</span>}
                        </span>
                        <span className="text-gray-500 font-normal">{open ? '▲' : '▼'}</span>
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {isCurrent
                          ? '학교를 누르면 상세 정보로 이동합니다'
                          : `이 화면에서는 상세를 열 수 없어 학교 홈페이지로 연결됩니다 (${CATEGORY_LABEL[id]} 유형에서 상세 확인)`}
                      </p>
                    </button>
                    {open && (
                      <div className="px-3.5 pb-3.5 pt-1">
                        {list.length === 0 ? (
                          <p className="text-[12px] text-gray-400 leading-relaxed">
                            이 계열은 {CATEGORY_LABEL[id]}에 등록된 학교가 없습니다. 다른 유형을 펼쳐 보세요.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {list.map((school) => {
                              const badges = matchedBadges(school, dialogRow.track);
                              const inner = (
                                <>
                                  <span className="flex items-center justify-between gap-2">
                                    <span className="text-[12.5px] font-semibold text-gray-100">
                                      {school.emoji} {school.shortName ?? school.name}
                                    </span>
                                    <DifficultyMark level={school.difficulty} color={isCurrent ? color : '#9ca3af'} />
                                  </span>
                                  <span className="flex flex-wrap gap-1 mt-1">
                                    {badges.map((badge) => (
                                      <span
                                        key={badge}
                                        className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold leading-none"
                                        style={{
                                          background: isCurrent
                                            ? hoverSchoolId === school.id
                                              ? color
                                              : `${color}22`
                                            : 'rgba(255,255,255,0.07)',
                                          color: isCurrent
                                            ? hoverSchoolId === school.id
                                              ? '#0b1020'
                                              : color
                                            : '#cbd5e1',
                                          border: `1px solid ${isCurrent ? `${color}55` : 'rgba(255,255,255,0.12)'}`,
                                        }}
                                      >
                                        {badge}
                                      </span>
                                    ))}
                                  </span>
                                  <span className="block text-[10px] text-gray-500 mt-1">{school.location}</span>
                                  {school.graduateCareer?.employmentRate && school.graduateCareer.employmentRate !== '미확인' && school.graduateCareer.employmentRate !== '미확인 (공개 자료 부족)' && (
                                    <span className="block text-[10px] mt-0.5" style={{ color: isCurrent ? color : '#9ca3af' }}>
                                      💼 취업률 {school.graduateCareer.employmentRate}
                                    </span>
                                  )}
                                </>
                              );
                              return isCurrent ? (
                                <button
                                  key={school.id}
                                  type="button"
                                  onClick={() => {
                                    setDialogTrackId(null);
                                    onSelectSchool?.(school);
                                  }}
                                  onMouseEnter={() => setHoverSchoolId(school.id)}
                                  onMouseLeave={() => setHoverSchoolId((prev) => (prev === school.id ? null : prev))}
                                  onFocus={() => setHoverSchoolId(school.id)}
                                  onBlur={() => setHoverSchoolId((prev) => (prev === school.id ? null : prev))}
                                  className="px-2.5 py-2 rounded-xl text-left transition-all duration-150 outline-none"
                                  style={
                                    hoverSchoolId === school.id
                                      ? {
                                          // 하이라이트 — 지금 고른 학교만 카테고리 색으로 떠오르게
                                          background: `${color}26`,
                                          border: `1px solid ${color}`,
                                          boxShadow: `0 0 0 2px ${color}33, 0 6px 18px ${color}30`,
                                          transform: 'translateY(-2px)',
                                        }
                                      : {
                                          background: 'rgba(255,255,255,0.04)',
                                          border: `1px solid ${color}33`,
                                          boxShadow: 'none',
                                        }
                                  }
                                >
                                  {inner}
                                </button>
                              ) : school.websiteUrl ? (
                                // 다른 유형 학교는 이 화면에서 상세를 열 수 없으므로 학교 홈페이지로 보낸다
                                <a
                                  key={school.id}
                                  href={school.websiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-2 rounded-xl block transition-colors hover:bg-white/10 focus-visible:bg-white/10 outline-none"
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
                                  <span className="block text-[10px] text-gray-500 mt-0.5">
                                    홈페이지 미등록 — {CATEGORY_LABEL[id]} 유형에서 확인
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
