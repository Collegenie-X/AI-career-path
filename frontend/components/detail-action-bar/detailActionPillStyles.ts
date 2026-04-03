import type { CSSProperties } from 'react';

const BASE: CSSProperties = {
  borderStyle: 'solid',
  borderWidth: 1,
};

/** 내 패스 상단과 동일: 수정(액센트 컬러) */
export function getDetailActionPillEditStyle(accentColor: string): CSSProperties {
  return {
    ...BASE,
    backgroundColor: `${accentColor}22`,
    color: accentColor,
    borderColor: `${accentColor}44`,
  };
}

/** 공유 — 채널 없음 */
export function getDetailActionPillShareNeutralStyle(): CSSProperties {
  return {
    ...BASE,
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.12)',
  };
}

/** 공유 — 채널 있음 (타입별 틴트) */
export function getDetailActionPillShareActiveStyle(color: string): CSSProperties {
  return {
    ...BASE,
    backgroundColor: `${color}18`,
    color,
    borderColor: `${color}40`,
  };
}

/** 체크(주간 체크 반영) 토글 — 내 패스 PlanActionBar와 동일 로직 */
export function getDetailActionPillCheckToggleStyle(accentColor: string, active: boolean): CSSProperties {
  return {
    ...BASE,
    backgroundColor: active ? `${accentColor}18` : 'rgba(255,255,255,0.05)',
    color: active ? accentColor : 'rgba(255,255,255,0.6)',
    borderColor: active ? `${accentColor}44` : 'rgba(255,255,255,0.1)',
  };
}

export function getDetailActionPillDeleteStyle(): CSSProperties {
  return {
    ...BASE,
    backgroundColor: 'rgba(239,68,68,0.12)',
    color: '#ef4444',
    borderColor: 'rgba(239,68,68,0.28)',
  };
}

export function getDetailActionPillCancelStyle(): CSSProperties {
  return {
    ...BASE,
    backgroundColor: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.5)',
    borderColor: 'rgba(255,255,255,0.1)',
  };
}

export function getDetailActionPillDeleteConfirmStyle(): CSSProperties {
  return {
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
  };
}
