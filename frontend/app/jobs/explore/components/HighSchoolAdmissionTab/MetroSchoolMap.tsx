'use client';

import { useMemo, useState } from 'react';
import { GlossaryText } from '@/components/shared/GlossaryText';
import metroMapData from '@/data/high-school/metro-school-map.json';
import type { HighSchoolDetail } from '../../types';
import { VerifySourceTable } from './CategoryStructuredSections';

/** 지도에 찍히는 학교 한 곳 */
type MetroPin = {
  name: string;
  shortName: string;
  sido: string;
  district: string;
  address: string;
  homepage?: string | null;
  tel?: string | null;
  source?: string;
  /** 직업계고에만 있는 정보 */
  depts?: string[];
  fields?: string[];
  schoolType?: string;
  isBusinessField?: boolean;
  note?: string;
  /** 이 유형 데이터셋의 학교 id — 있으면 클릭 시 상세 카드가 열린다 */
  schoolId?: string;
};

type MetroDistrict = { name: string; polygons: string[] };
type MetroRegion = { id: string; name: string; viewBox: string; districts: MetroDistrict[] };

export type MetroMapFocus = 'all' | 'meister' | 'business';

const REGION_ORDER: { id: string; label: string }[] = [
  { id: 'seoul', label: '서울' },
  { id: 'gyeonggi', label: '경기' },
  { id: 'incheon', label: '인천' },
];

const FILTERS: { id: MetroMapFocus; label: string; hint: string; match: (p: MetroPin) => boolean }[] = [
  { id: 'all', label: '전체', hint: '이 유형의 수도권 학교 전부', match: () => true },
  { id: 'meister', label: '⭐ 마이스터고', hint: '국가가 산업 분야를 지정한 학교 (전기 전형)', match: (p) => p.schoolType === '마이스터고' },
  { id: 'business', label: '💼 금융·경영계열', hint: '금융·회계·세무·사무·유통·무역 학과가 있는 학교', match: (p) => Boolean(p.isBusinessField) },
];

function centroid(points: string): { x: number; y: number } {
  const pairs = points.split(' ').map((p) => p.split(',').map(Number));
  const sum = pairs.reduce((acc, [x, y]) => ({ x: acc.x + x, y: acc.y + y }), { x: 0, y: 0 });
  return { x: sum.x / pairs.length, y: sum.y / pairs.length };
}

/** 폴리곤이 여러 개인 자치구는 가장 큰 조각에 라벨을 찍는다 */
function labelAnchor(polygons: string[]): { x: number; y: number } {
  const biggest = polygons.reduce((a, b) => (b.length > a.length ? b : a), polygons[0] ?? '0,0');
  return centroid(biggest);
}

export function MetroSchoolMap({
  categoryId,
  categoryName,
  color,
  bgColor,
  focus = 'all',
  schools = [],
  onSelectSchool,
}: {
  categoryId: string;
  categoryName: string;
  color: string;
  bgColor: string;
  /** 직업계고 영역에서 기본으로 켤 필터 */
  focus?: MetroMapFocus;
  /** 이 유형의 상세 카드 데이터 — 지도에서 바로 열기 위해 받는다 */
  schools?: HighSchoolDetail[];
  onSelectSchool?: (school: HighSchoolDetail) => void;
}) {
  const regions = metroMapData.regions as Record<string, MetroRegion>;
  const districtAlias = (metroMapData.districtAlias ?? {}) as Record<string, string>;
  const districtLabel = (metroMapData.districtLabel ?? {}) as Record<string, string>;
  /** 행정구역 개편으로 주소의 구 이름이 지도 경계와 다를 때 지도 쪽 이름으로 맞춘다 */
  const mapKey = (name: string) => districtAlias[name] ?? name;
  const allPins = ((metroMapData.categories as Record<string, { pins: MetroPin[] } | undefined>)[categoryId]?.pins ??
    []) as MetroPin[];

  const hasVocationalInfo = allPins.some((p) => p.schoolType || p.isBusinessField);
  const [filter, setFilter] = useState<MetroMapFocus>(hasVocationalInfo ? focus : 'all');

  const activeMatch = FILTERS.find((f) => f.id === filter)?.match ?? (() => true);
  const pins = useMemo(() => allPins.filter(activeMatch), [allPins, filter]);

  const byRegion = useMemo(() => {
    const acc: Record<string, MetroPin[]> = { seoul: [], gyeonggi: [], incheon: [] };
    pins.forEach((p) => acc[p.sido]?.push(p));
    return acc;
  }, [pins]);

  const defaultRegion = useMemo(
    () => REGION_ORDER.map((r) => r.id).sort((a, b) => (byRegion[b]?.length ?? 0) - (byRegion[a]?.length ?? 0))[0],
    // 최초 1회만 계산해 탭이 멋대로 바뀌지 않게 한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [regionId, setRegionId] = useState<string>(defaultRegion ?? 'seoul');
  const region = regions[regionId] ?? regions.seoul;
  const regionPins = byRegion[regionId] ?? [];

  const countByDistrict = useMemo(() => {
    const acc: Record<string, number> = {};
    regionPins.forEach((p) => {
      const key = mapKey(p.district);
      acc[key] = (acc[key] ?? 0) + 1;
    });
    return acc;
  }, [regionPins]);

  const firstDistrictWithSchools = region.districts.find((d) => (countByDistrict[d.name] ?? 0) > 0)?.name ?? null;
  const [selectedByRegion, setSelectedByRegion] = useState<Record<string, string | null>>({});
  const [pinDialog, setPinDialog] = useState<MetroPin | null>(null);
  const selectedDistrict = selectedByRegion[regionId] ?? firstDistrictWithSchools;
  const selectedPins = regionPins.filter((p) => mapKey(p.district) === selectedDistrict);
  const maxCount = Math.max(1, ...Object.values(countByDistrict));

  if (allPins.length === 0) return null;

  const pickDistrict = (name: string) => setSelectedByRegion((prev) => ({ ...prev, [regionId]: name }));

  /** 상세 카드가 있으면 기존 학교 다이얼로그, 없으면 지도 전용 간이 다이얼로그 */
  const openSchool = (pin: MetroPin) => {
    const detail = pin.schoolId ? schools.find((s) => s.id === pin.schoolId) : undefined;
    if (detail && onSelectSchool) {
      onSelectSchool(detail);
      return;
    }
    setPinDialog(pin);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color }}>
        🗺️ 수도권 지도에서 찾기 — {categoryName}
      </p>

      {/* 안내 */}
      <div
        className="rounded-2xl p-3.5"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${color}33` }}
      >
        <p className="text-[12px] text-gray-300 leading-relaxed">
          <GlossaryText>{metroMapData.note}</GlossaryText>
        </p>
        <p className="text-[12px] text-gray-200 leading-relaxed mt-2">
          수도권 <b style={{ color }}>{pins.length}교</b> · 서울 {byRegion.seoul.length} · 경기 {byRegion.gyeonggi.length} · 인천{' '}
          {byRegion.incheon.length}
        </p>
        <p className="text-[11px] text-gray-500 mt-1.5">기준 시점: {metroMapData.asOf}</p>
      </div>

      {/* 시·도 탭 */}
      <div className="flex gap-1.5">
        {REGION_ORDER.map((r) => {
          const on = regionId === r.id;
          const n = byRegion[r.id]?.length ?? 0;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRegionId(r.id)}
              disabled={n === 0}
              className="flex-1 px-2 py-2 rounded-xl text-[12px] font-bold transition-colors disabled:opacity-40"
              style={{
                background: on ? `${color}33` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${on ? color : `${color}22`}`,
                color: on ? '#fff' : '#d1d5db',
              }}
            >
              {r.label} {n}교
            </button>
          );
        })}
      </div>

      {/* 직업계고 필터 (해당 데이터가 있을 때만) */}
      {hasVocationalInfo && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const on = filter === f.id;
              const n = allPins.filter(f.match).length;
              if (n === 0) return null;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  title={f.hint}
                  className="px-2.5 py-1.5 rounded-xl text-[12px] font-bold transition-colors"
                  style={{
                    background: on ? `${color}33` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${on ? color : `${color}22`}`,
                    color: on ? '#fff' : '#d1d5db',
                  }}
                >
                  {f.label} {n}교
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed -mt-0.5">{FILTERS.find((f) => f.id === filter)?.hint}</p>
        </>
      )}

      {/* 지도 */}
      <div
        className="rounded-2xl p-2"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${color}33` }}
      >
        <svg viewBox={region.viewBox} className="w-full h-auto" role="img" aria-label={`${region.name} ${categoryName} 지도`}>
          {region.districts.map((d) => {
            const count = countByDistrict[d.name] ?? 0;
            const isSelected = d.name === selectedDistrict;
            const fillAlpha = count === 0 ? 0.05 : 0.15 + (count / maxCount) * 0.55;
            const { x, y } = labelAnchor(d.polygons);
            return (
              <g key={d.name}>
                {d.polygons.map((poly, i) => (
                  <polygon
                    key={i}
                    points={poly}
                    onClick={() => count > 0 && pickDistrict(d.name)}
                    tabIndex={count > 0 ? 0 : -1}
                    role={count > 0 ? 'button' : undefined}
                    aria-label={`${d.name} ${count}교`}
                    onKeyDown={(e) => {
                      if (count > 0 && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        pickDistrict(d.name);
                      }
                    }}
                    style={{
                      cursor: count > 0 ? 'pointer' : 'default',
                      fill:
                        count === 0
                          ? 'rgba(255,255,255,0.05)'
                          : `${color}${Math.round(fillAlpha * 255).toString(16).padStart(2, '0')}`,
                      stroke: isSelected ? '#fff' : `${color}66`,
                      strokeWidth: isSelected ? 5 : 1.5,
                      transition: 'fill 0.15s, stroke 0.15s',
                    }}
                  />
                ))}
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  paintOrder="stroke"
                  stroke="rgba(0,0,0,0.75)"
                  strokeWidth={3.5}
                  style={{
                    pointerEvents: 'none',
                    fill: isSelected ? '#fff' : count === 0 ? '#8b93a1' : '#f3f4f6',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {d.name.replace(/(시|군|구)$/, '')} {count}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 선택한 시·군·구의 학교 */}
      <div
        className="rounded-2xl p-3.5 space-y-2"
        style={{ background: `linear-gradient(135deg, ${bgColor} 0%, rgba(0,0,0,0.25) 100%)`, border: `1px solid ${color}33` }}
      >
        <p className="text-[13px] font-bold" style={{ color }}>
          📍 {region.name} {selectedDistrict ? districtLabel[selectedDistrict] ?? selectedDistrict : ''} — {selectedPins.length}교
        </p>

        {selectedPins.length === 0 ? (
          <p className="text-[12px] text-gray-400 leading-relaxed">
            이 지역에는 해당 학교가 <b className="text-gray-200">없습니다.</b> 색이 들어온 다른 지역을 눌러보세요.
          </p>
        ) : (
          selectedPins.map((p) => (
            <div
              key={p.name}
              role="button"
              tabIndex={0}
              onClick={() => openSchool(p)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openSchool(p);
                }
              }}
              className="w-full text-left rounded-xl p-3 cursor-pointer transition-colors hover:bg-white/[0.08]"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}22` }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold text-gray-100">
                  {p.schoolType === '마이스터고' ? '⭐ ' : ''}
                  {p.shortName}
                  <span className="ml-1 text-[10px] font-normal" style={{ color }}>
                    {p.schoolId ? '상세 보기 ›' : '정보 보기 ›'}
                  </span>
                </p>
                {p.schoolType && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                    style={{
                      background: p.schoolType === '마이스터고' ? 'rgba(251,191,36,0.16)' : 'rgba(255,255,255,0.08)',
                      color: p.schoolType === '마이스터고' ? '#fbbf24' : '#9ca3af',
                    }}
                  >
                    {p.schoolType}
                  </span>
                )}
              </div>

              {p.depts && p.depts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {p.depts.map((dept) => (
                    <span key={dept} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: `${color}1a`, color: '#e5e7eb' }}>
                      {dept}
                    </span>
                  ))}
                </div>
              )}

              {p.fields && p.fields.length > 0 && (
                <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">분야 {p.fields.join(' · ')}</p>
              )}

              {p.note && (
                <p className="text-[11px] text-amber-300/90 leading-relaxed mt-1.5">
                  <GlossaryText>{p.note}</GlossaryText>
                </p>
              )}

              <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{p.address}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {p.tel && (
                  <a
                    href={`tel:${p.tel.replace(/[^0-9+]/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] hover:opacity-80"
                    style={{ color }}
                  >
                    ☎ {p.tel}
                  </a>
                )}
                {p.homepage && (
                  <a
                    href={p.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[11px] underline decoration-dotted underline-offset-2 hover:opacity-80"
                    style={{ color }}
                  >
                    학교 홈페이지 ↗
                  </a>
                )}
              </div>
            </div>
          ))
        )}

        <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
          <GlossaryText>{metroMapData.shapeNote}</GlossaryText>
        </p>
        {regionId === 'incheon' && (
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <GlossaryText>{metroMapData.districtNote}</GlossaryText>
          </p>
        )}
        {hasVocationalInfo && (
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <GlossaryText>{metroMapData.fieldNote}</GlossaryText>
          </p>
        )}
      </div>

      <VerifySourceTable sources={metroMapData.sources} color={color} bgColor={bgColor} title="🔎 이 지도의 출처" />

      {/* 상세 카드가 없는 학교(지도 전용)의 간이 다이얼로그 */}
      {pinDialog && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3 sm:p-6"
          style={{ background: 'rgba(2,6,23,0.75)' }}
          onClick={() => setPinDialog(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${pinDialog.shortName} 정보`}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-4"
            style={{ background: '#0f172a', border: `1px solid ${color}55` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[15px] font-bold text-white">
                  {pinDialog.schoolType === '마이스터고' ? '⭐ ' : ''}
                  {pinDialog.shortName}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">{pinDialog.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPinDialog(null)}
                aria-label="닫기"
                className="text-gray-400 hover:text-white text-[18px] leading-none px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {pinDialog.depts && pinDialog.depts.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color }}>🎓 개설 학과</p>
                  <div className="flex flex-wrap gap-1">
                    {pinDialog.depts.map((dept) => (
                      <span key={dept} className="text-[11px] px-1.5 py-0.5 rounded-md" style={{ background: `${color}1a`, color: '#e5e7eb' }}>
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {pinDialog.fields && pinDialog.fields.length > 0 && (
                <p className="text-[11px] text-gray-400">분야 {pinDialog.fields.join(' · ')}</p>
              )}

              {pinDialog.note && (
                <p className="text-[11px] text-amber-300/90 leading-relaxed">
                  <GlossaryText>{pinDialog.note}</GlossaryText>
                </p>
              )}

              <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}22` }}>
                <p className="text-[12px] text-gray-200 leading-relaxed">📍 {pinDialog.address}</p>
                {pinDialog.tel && (
                  <a
                    href={`tel:${pinDialog.tel.replace(/[^0-9+]/g, '')}`}
                    className="text-[12px] block mt-1 hover:opacity-80"
                    style={{ color }}
                  >
                    ☎ {pinDialog.tel}
                  </a>
                )}
                {pinDialog.homepage && (
                  <a
                    href={pinDialog.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] block mt-1 underline decoration-dotted underline-offset-2 hover:opacity-80"
                    style={{ color }}
                  >
                    학교 홈페이지 ↗
                  </a>
                )}
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                이 학교는 <b className="text-gray-300">아직 상세 카드가 없는 지도 전용 학교</b>입니다. 전형·등록금·진학 실적은
                <b className="text-gray-300"> 학교 홈페이지 모집요강</b>과 아래 확인처에서 직접 확인하세요.
                {pinDialog.source ? ` (출처: ${pinDialog.source})` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
