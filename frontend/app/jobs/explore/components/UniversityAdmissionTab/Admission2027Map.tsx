'use client';

import { useMemo, useState } from 'react';
import { GlossaryText } from '@/components/shared/GlossaryText';
import mapData from '@/data/university-admission/admission-2027/university-map.json';

/* ── 2027 대입 대전환 — 전국 대학 위치 지도 ────────────────────────
 * 고입의 수도권 학교 지도(MetroSchoolMap)와 같은 역할을 대입에서 한다.
 * 다만 대학은 전국에 흩어져 있어 수도권만으로는 지도가 성립하지 않는다.
 * 그래서 실제 위경도를 단순화한 17개 시도 폴리곤을 직접 그리고,
 * 권역(수도권·강원·충청·호남·영남·제주) 단위로 좁혀 볼 수 있게 했다. */

type MapPin = {
  id: string;
  name: string;
  emoji: string;
  areaId: string;
  color: string;
  sido: string;
  sidoId: string;
  zone: string;
  city: string;
  commuteNote: string;
  singleCampus: boolean;
};

type MapRegion = {
  id: string;
  name: string;
  zone: string;
  points: string;
  zoneColor: string;
  labelX: number;
  labelY: number;
  pinX: number;
  pinY: number;
  behind?: boolean;
  /** 시도 이름 글자 크기 — 면적이 작은 광역시는 지시선으로 빼고 크게 쓴다 */
  labelSize?: number;
  labelAnchor?: 'start' | 'middle';
  /** 라벨을 폴리곤 밖으로 뺀 경우 이어주는 지시선 */
  leader?: { x1: number; y1: number; x2: number; y2: number } | null;
};

type MapZone = { id: string; label: string; hint: string };

const REGIONS = mapData.regions as MapRegion[];
const PINS = mapData.pins as MapPin[];
const ZONES = mapData.zones as MapZone[];
const LEGEND = mapData.meta.legend as Array<{ areaId: string; label: string; color: string }>;
const ZONE_COLORS = mapData.meta.zoneColors as Record<string, string>;

/** 권역 탭 색 — '전국'은 중립색 */
function zoneColorOf(zoneId: string) {
  return ZONE_COLORS[zoneId] ?? '#22D3EE';
}

/** 한 시도 안에서 대학 핀을 겹치지 않게 격자로 흩뿌린다 */
function scatter(region: MapRegion, count: number) {
  const cols = count <= 2 ? count : count <= 6 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  return Array.from({ length: count }, (_, i) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    const rowCount = Math.min(cols, count - r * cols);
    return {
      x: region.pinX - ((rowCount - 1) * 21) / 2 + c * 21,
      y: region.pinY - ((rows - 1) * 20) / 2 + r * 20,
    };
  });
}

export function Admission2027Map({
  selectedAreaId,
  onSelectUniversity,
}: {
  /** 현재 보고 있는 영역 — 이 영역 대학만 색이 살아난다 */
  readonly selectedAreaId: string;
  readonly onSelectUniversity: (universityId: string) => void;
}) {
  const [onlyCurrentArea, setOnlyCurrentArea] = useState(true);
  const [zone, setZone] = useState<string>('all');
  const [activeId, setActiveId] = useState<string | null>(null);

  const visiblePins = useMemo(() => {
    return PINS.filter(
      (p) => (!onlyCurrentArea || p.areaId === selectedAreaId) && (zone === 'all' || p.zone === zone)
    );
  }, [onlyCurrentArea, selectedAreaId, zone]);

  const byRegion = useMemo(() => {
    const m = new Map<string, MapPin[]>();
    for (const p of visiblePins) {
      const arr = m.get(p.sidoId) ?? [];
      arr.push(p);
      m.set(p.sidoId, arr);
    }
    return m;
  }, [visiblePins]);

  /** 권역별 개수 — 탭에 숫자를 붙여 어디에 몰려 있는지 바로 보이게 한다 */
  const zoneCount = useMemo(() => {
    const base = PINS.filter((p) => !onlyCurrentArea || p.areaId === selectedAreaId);
    const m = new Map<string, number>();
    for (const p of base) m.set(p.zone, (m.get(p.zone) ?? 0) + 1);
    m.set('all', base.length);
    return m;
  }, [onlyCurrentArea, selectedAreaId]);

  const active = activeId ? PINS.find((p) => p.id === activeId) ?? null : null;

  const regionSummary = useMemo(
    () => REGIONS.map((r) => ({ region: r, pins: byRegion.get(r.id) ?? [] })).filter((x) => x.pins.length > 0),
    [byRegion]
  );

  const sorted = useMemo(
    () => [...REGIONS].sort((a, b) => Number(Boolean(b.behind)) - Number(Boolean(a.behind))),
    []
  );

  return (
    <div
      className="rounded-xl p-3 space-y-3"
      style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(148,163,184,0.25)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[13px] font-bold text-white flex items-center gap-1.5">
            <span aria-hidden>🗺️</span> 전국 대학 위치 지도
          </h3>
          <p className="text-[11px] text-white/60 mt-0.5 leading-relaxed">
            <GlossaryText>{mapData.meta.whyLocation}</GlossaryText>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOnlyCurrentArea((v) => !v)}
          className="flex-shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all hover:bg-white/10"
          style={{
            background: onlyCurrentArea ? 'rgba(255,255,255,0.06)' : 'rgba(34,211,238,0.2)',
            border: '1px solid rgba(148,163,184,0.35)',
            color: 'white',
          }}
          aria-pressed={!onlyCurrentArea}
        >
          {onlyCurrentArea ? '이 영역만' : '3영역 전체'}
        </button>
      </div>

      {/* 권역 탭 */}
      <div className="flex flex-wrap gap-1.5">
        {ZONES.map((z) => {
          const n = zoneCount.get(z.id) ?? 0;
          const isActive = zone === z.id;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => setZone(z.id)}
              disabled={n === 0}
              title={z.hint}
              className="rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.03]"
              style={{
                background: isActive ? `${zoneColorOf(z.id)}33` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isActive ? zoneColorOf(z.id) : 'rgba(148,163,184,0.3)'}`,
                color: 'white',
              }}
              aria-pressed={isActive}
            >
              {z.label}
              <span className="ml-1 text-white/50">{n}</span>
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-2">
        {LEGEND.map((l) => (
          <span key={l.areaId} className="flex items-center gap-1 text-[11px] text-white/70">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{
                background: l.color,
                opacity: onlyCurrentArea && l.areaId !== selectedAreaId ? 0.25 : 1,
              }}
              aria-hidden
            />
            {l.label}
          </span>
        ))}
        <span className="text-[11px] text-white/45">· ⚠는 캠퍼스가 2곳 이상</span>
      </div>

      {/* 권역 색 범례 */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {Object.entries(ZONE_COLORS).map(([name, color]) => (
          <span key={name} className="flex items-center gap-1 text-[10.5px] text-white/55">
            <span
              className="inline-block w-3 h-2 rounded-[2px]"
              style={{ background: color, opacity: 0.6 }}
              aria-hidden
            />
            {name}
          </span>
        ))}
      </div>

      {/* 지도 */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'rgba(2,6,23,0.6)' }}>
        <svg
          viewBox={mapData.meta.viewBox}
          className="w-full"
          style={{ maxHeight: 620 }}
          role="img"
          aria-label="전국 시도 경계를 단순화한 대학 위치 지도"
        >
          {/* 시도 폴리곤 — 경기는 서울·인천에 가리지 않도록 먼저 그린다 */}
          {sorted.map((r) => {
            const count = (byRegion.get(r.id) ?? []).length;
            const inZone = zone === 'all' || r.zone === zone;
            /* 권역별로 색을 달리 칠한다. 선택한 권역 밖은 흐리게, 대학이 있는 시도는 진하게 */
            const fillOpacity = !inZone ? 0.08 : count > 0 ? 0.42 : 0.2;
            const strokeOpacity = !inZone ? 0.25 : count > 0 ? 0.95 : 0.55;
            return (
              <polygon
                key={r.id}
                points={r.points}
                fill={r.zoneColor}
                fillOpacity={fillOpacity}
                stroke={r.zoneColor}
                strokeOpacity={strokeOpacity}
                strokeWidth={count > 0 ? 1.6 : 1}
                strokeLinejoin="round"
              />
            );
          })}

          {/* 시도 이름 — 면적이 작은 광역시(세종·대전)는 밖으로 빼고 지시선으로 잇는다 */}
          {REGIONS.map((r) => {
            const count = (byRegion.get(r.id) ?? []).length;
            const inZone = zone === 'all' || r.zone === zone;
            const fill =
              count > 0
                ? 'rgba(224,242,254,0.98)'
                : inZone
                  ? 'rgba(203,213,225,0.7)'
                  : 'rgba(148,163,184,0.3)';
            return (
              <g key={`t-${r.id}`} pointerEvents="none">
                {r.leader && (
                  <>
                    <line
                      x1={r.leader.x1}
                      y1={r.leader.y1}
                      x2={r.leader.x2}
                      y2={r.leader.y2}
                      stroke={r.zoneColor}
                      strokeOpacity={inZone ? 0.8 : 0.25}
                      strokeWidth={1.4}
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={r.leader.x2}
                      cy={r.leader.y2}
                      r={3}
                      fill={r.zoneColor}
                      fillOpacity={inZone ? 0.95 : 0.3}
                    />
                  </>
                )}
                <text
                  x={r.labelX}
                  y={r.labelY}
                  fontSize={r.labelSize ?? 15}
                  fontWeight={800}
                  stroke="rgba(2,6,23,0.9)"
                  strokeWidth={3.4}
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  letterSpacing="-0.3"
                  textAnchor={r.labelAnchor ?? 'middle'}
                  fill={fill}
                >
                  {r.name}
                  {count > 0 ? ` ${count}` : ''}
                </text>
              </g>
            );
          })}

          {/* 대학 핀 */}
          {REGIONS.map((r) => {
            const pins = byRegion.get(r.id) ?? [];
            if (pins.length === 0) return null;
            const pos = scatter(r, pins.length);
            return pins.map((p, i) => {
              const dim = !onlyCurrentArea && p.areaId !== selectedAreaId;
              const isActive = activeId === p.id;
              return (
                <g
                  key={`${r.id}-${p.id}`}
                  transform={`translate(${pos[i].x}, ${pos[i].y})`}
                  onMouseEnter={() => setActiveId(p.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(p.id)}
                  onBlur={() => setActiveId(null)}
                  onClick={() => onSelectUniversity(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') onSelectUniversity(p.id);
                  }}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.name} — ${p.city}`}
                >
                  {isActive && <circle r={15} fill={p.color} fillOpacity={0.25} />}
                  <circle
                    r={isActive ? 9 : 7.5}
                    fill={p.color}
                    fillOpacity={dim ? 0.3 : 0.95}
                    stroke="white"
                    strokeOpacity={dim ? 0.2 : 0.85}
                    strokeWidth={1.6}
                  />
                  {!p.singleCampus && (
                    <text x={7} y={-6} fontSize={13} fill="#FDE68A" pointerEvents="none" aria-hidden>
                      ⚠
                    </text>
                  )}
                </g>
              );
            });
          })}
        </svg>
      </div>

      {/* 핀 정보 */}
      <div
        className="rounded-lg px-3 py-2 min-h-[54px]"
        style={{ background: 'rgba(2,6,23,0.55)', border: '1px solid rgba(148,163,184,0.22)' }}
      >
        {active ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span aria-hidden>{active.emoji}</span>
              <span className="text-[13px] font-bold text-white">{active.name}</span>
              <span className="text-[11px] text-white/60">{active.city}</span>
              {!active.singleCampus && (
                <span className="text-[10px] px-1.5 py-[2px] rounded bg-amber-500/20 text-amber-200">
                  캠퍼스 2곳 이상
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/65 mt-1 leading-relaxed">{active.commuteNote}</p>
          </>
        ) : (
          <p className="text-[11px] text-white/45 leading-relaxed">
            지도의 점에 마우스를 올리면 <b className="text-white/70">소재 도시와 통학 정보</b>가, 누르면 대학
            상세가 열립니다. 위 <b className="text-white/70">권역 탭</b>으로 좁혀 볼 수도 있어요.
          </p>
        )}
      </div>

      {/* 지역별 목록 — 지도 없이도 읽히는 대체 정보 */}
      <details>
        <summary className="cursor-pointer text-[12px] font-bold text-white/80 hover:text-white select-none">
          지역별 대학 목록 펼치기 ({visiblePins.length}개교)
        </summary>
        <div className="mt-2 space-y-2">
          {regionSummary.map(({ region, pins }) => (
            <div key={region.id}>
              <div className="text-[11px] font-bold text-sky-200/90 mb-1">
                {region.name} <span className="text-white/40">{pins.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pins.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectUniversity(p.id)}
                    className="rounded-lg px-2 py-1 text-[11px] text-white/85 transition-all hover:scale-[1.03]"
                    style={{ background: `${p.color}22`, border: `1px solid ${p.color}55` }}
                  >
                    {p.emoji} {p.name}
                    <span className="ml-1 text-white/45">{p.city}</span>
                    {!p.singleCampus && <span className="ml-1 text-amber-300">⚠</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>

      <p className="text-[10.5px] text-white/40 leading-relaxed">
        {String(mapData.meta.mapNote ?? '').replace(/==/g, '')}
      </p>
    </div>
  );
}
