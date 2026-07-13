import type { TrackDef } from '../tracks';
import type { PhaseKey } from '../types';

/** 주차 제목 키워드로 phase 추론 (휴리스틱). 사용자가 UI에서 언제든 교정 가능 */
export function inferPhase(track: TrackDef, title: string): PhaseKey {
  const text = (title ?? '').toLowerCase();
  for (const phase of track.phases) {
    const hit = track.phaseKeywords[phase.key]?.some((kw) => text.includes(kw.toLowerCase()));
    if (hit) return phase.key;
  }
  return track.fallbackPhase;
}

export function phaseOrderIndex(track: TrackDef, phase: PhaseKey): number {
  const idx = track.phases.findIndex((p) => p.key === phase);
  return idx >= 0 ? idx : 0;
}
