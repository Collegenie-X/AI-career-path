'use client';

import { useMemo, useState } from 'react';
import nationalMapData from '@/data/university-admission/admission-2027/university-map.json';
import type { HighSchoolDetail } from '../../types';
import { CompetitionBadge } from './CompetitionBadge';

/** 대입 대학 위치 지도와 같은 시·도 경계(개념 지도)를 재사용한다 */
type SidoRegion = {
  id: string;
  name: string;
  points: string;
  labelX: number;
  labelY: number;
  behind?: boolean;
  labelSize?: number;
  labelAnchor?: 'start' | 'middle';
  leader?: { x1: number; y1: number; x2: number; y2: number } | null;
};

const REGIONS = nationalMapData.regions as SidoRegion[];

/** 주소 첫머리(정식·약칭·옛 이름) → 시·도 id */
const SIDO_PREFIX: [string, string][] = [
  ['서울', 'seoul'],
  ['인천', 'incheon'],
  ['경기', 'gyeonggi'],
  ['강원', 'gangwon'],
  ['세종', 'sejong'],
  ['대전', 'daejeon'],
  ['충청북', 'chungbuk'],
  ['충북', 'chungbuk'],
  ['충청남', 'chungnam'],
  ['충남', 'chungnam'],
  ['대구', 'daegu'],
  ['경상북', 'gyeongbuk'],
  ['경북', 'gyeongbuk'],
  ['부산', 'busan'],
  ['울산', 'ulsan'],
  ['경상남', 'gyeongnam'],
  ['경남', 'gyeongnam'],
  ['광주', 'gwangju'],
  ['전남광주통합특별시(광주)', 'gwangju'],
  ['전남광주통합특별시', 'jeonnam'],
  ['전라남', 'jeonnam'],
  ['전남', 'jeonnam'],
  ['전북', 'jeonbuk'],
  ['전라북', 'jeonbuk'],
  ['제주', 'jeju'],
];

function sidoOf(location: string): string | null {
  const loc = location.trim();
  // 긴 접두어부터 맞춰야 '전남광주통합특별시(광주)'가 '전남'에 먼저 걸리지 않는다
  const hit = [...SIDO_PREFIX].sort((a, b) => b[0].length - a[0].length).find(([prefix]) => loc.startsWith(prefix));
  return hit?.[1] ?? null;
}

const DIFFICULTY_LABEL: Record<number, string> = { 1: '입문', 2: '보통', 3: '중상위', 4: '상위권', 5: '최상위' };

export function NationalSchoolMap({
  categoryName,
  color,
  bgColor,
  schools,
  onSelectSchool,
}: {
  categoryName: string;
  color: string;
  bgColor: string;
  schools: HighSchoolDetail[];
  onSelectSchool?: (school: HighSchoolDetail) => void;
}) {
  const bySido = useMemo(() => {
    const acc: Record<string, HighSchoolDetail[]> = {};
    schools.forEach((s) => {
      const id = sidoOf(s.location ?? '');
      if (id) (acc[id] ??= []).push(s);
    });
    return acc;
  }, [schools]);

  const placed = Object.values(bySido).reduce((n, list) => n + list.length, 0);
  const metroCount = ['seoul', 'gyeonggi', 'incheon'].reduce((n, id) => n + (bySido[id]?.length ?? 0), 0);
  const maxCount = Math.max(1, ...Object.values(bySido).map((l) => l.length));

  const [selected, setSelected] = useState<string | null>(
    () => Object.entries(bySido).sort((a, b) => b[1].length - a[1].length)[0]?.[0] ?? null,
  );
  const selectedRegion = REGIONS.find((r) => r.id === selected) ?? null;
  const selectedSchools = selected ? bySido[selected] ?? [] : [];

  // 경기는 서울·인천에 가리지 않도록 먼저 그린다
  const drawOrder = useMemo(() => [...REGIONS].sort((a, b) => Number(Boolean(b.behind)) - Number(Boolean(a.behind))), []);

  if (placed === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color }}>
        🗺️ 전국 지도에서 찾기 — {categoryName}
      </p>

      <div
        className="rounded-2xl p-3.5"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${color}33` }}
      >
        <p className="text-[12px] text-gray-200 leading-relaxed">
          전국 <b style={{ color }}>{placed}교</b> · 수도권 {metroCount} · 그 밖 {placed - metroCount}
        </p>
        <p className="text-[11px] text-gray-500 mt-1.5">
          시·도를 누르면 그 지역 학교가 나옵니다. 서울·경기·인천은 아래 수도권 지도에서 구·시 단위로 더 자세히 볼 수 있어요.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden p-2"
        style={{ background: `linear-gradient(160deg, ${bgColor} 0%, rgba(0,0,0,0.35) 100%)`, border: `1px solid ${color}33` }}
      >
        <svg
          viewBox={nationalMapData.meta.viewBox}
          className="block w-full mx-auto"
          style={{ maxHeight: 440 }}
          role="img"
          aria-label={`${categoryName} 시·도별 학교 수 지도`}
        >
          {drawOrder.map((r) => {
            const count = bySido[r.id]?.length ?? 0;
            const isSelected = selected === r.id;
            const fillAlpha = count === 0 ? 0 : 0.25 + 0.6 * (count / maxCount);
            return (
              <polygon
                key={r.id}
                points={r.points}
                onClick={() => count > 0 && setSelected(r.id)}
                tabIndex={count > 0 ? 0 : -1}
                role={count > 0 ? 'button' : undefined}
                aria-label={`${r.name} ${count}교`}
                onKeyDown={(e) => {
                  if (count > 0 && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    setSelected(r.id);
                  }
                }}
                strokeLinejoin="round"
                style={{
                  cursor: count > 0 ? 'pointer' : 'default',
                  fill:
                    count === 0
                      ? 'rgba(255,255,255,0.05)'
                      : `${color}${Math.round(fillAlpha * 255).toString(16).padStart(2, '0')}`,
                  stroke: isSelected ? '#fff' : `${color}66`,
                  strokeWidth: isSelected ? 2.4 : 1,
                  transition: 'fill 0.15s, stroke 0.15s',
                }}
              />
            );
          })}

          {/* 시·도 이름 — 면적이 작은 광역시(세종·대전)는 밖으로 빼고 지시선으로 잇는다 */}
          {REGIONS.map((r) => {
            const count = bySido[r.id]?.length ?? 0;
            const isSelected = selected === r.id;
            return (
              <g key={`t-${r.id}`} pointerEvents="none">
                {r.leader && (
                  <line
                    x1={r.leader.x1}
                    y1={r.leader.y1}
                    x2={r.leader.x2}
                    y2={r.leader.y2}
                    stroke={`${color}99`}
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                  />
                )}
                <text
                  x={r.labelX}
                  y={r.labelY}
                  fontSize={r.labelSize ?? 15}
                  fontWeight={800}
                  stroke="rgba(0,0,0,0.75)"
                  strokeWidth={3.4}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  textAnchor={r.labelAnchor ?? 'middle'}
                  fill={isSelected ? '#fff' : count === 0 ? '#8b93a1' : '#f3f4f6'}
                >
                  {r.name} {count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 선택한 시·도의 학교 */}
      <div
        className="rounded-2xl p-3.5 space-y-2"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${color}33` }}
      >
        <p className="text-[13px] font-bold" style={{ color }}>
          📍 {selectedRegion?.name ?? ''} — {selectedSchools.length}교
        </p>
        {selectedSchools.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelectSchool?.(s)}
            className="w-full text-left rounded-xl p-3 transition-colors hover:bg-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}22` }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[13px] font-bold text-gray-100">
                {s.emoji} {s.shortName || s.name}
                <span className="ml-1 text-[10px] font-normal" style={{ color }}>
                  상세 보기 ›
                </span>
              </p>
              <div className="flex flex-wrap justify-end gap-1 flex-shrink-0">
                {s.difficulty ? (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap"
                    style={{ background: `${color}1f`, color, border: `1px solid ${color}44` }}
                  >
                    {'★'.repeat(s.difficulty)}
                    {'☆'.repeat(5 - s.difficulty)} {DIFFICULTY_LABEL[s.difficulty] ?? ''}
                  </span>
                ) : null}
                <CompetitionBadge raw={s.competitionLevel} color={color} size={10} />
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{s.location}</p>
          </button>
        ))}
        <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
          시·도 경계는 실제 지리를 단순화한 개념 지도입니다. 학교 위치는 상세 카드의 주소(시·도) 기준으로 셌습니다.
        </p>
      </div>
    </div>
  );
}
