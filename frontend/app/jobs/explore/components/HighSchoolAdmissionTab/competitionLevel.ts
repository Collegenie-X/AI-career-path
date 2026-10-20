/** "1.19:1 (2026학년도) — 2024 …" → 큰 숫자와 보조 설명으로 나눈다. 비율이 없으면 설명문만 */
export function splitCompetition(raw: string): { headline: string | null; detail: string } {
  const text = raw.replace(/^\*\s*/, '').trim();
  const ratio = text.match(/^(\d+(?:\.\d+)?(?:~\d+(?:\.\d+)?)?\s*:\s*1)\s*(.*)$/);
  if (ratio) return { headline: ratio[1].replace(/\s/g, ''), detail: ratio[2].replace(/^—\s*/, '') };
  const closed = text.match(/^(미공개|비공개|첫 모집 전|평준화 배정)\s*—\s*(.*)$/);
  if (closed) return { headline: closed[1], detail: closed[2] };
  return { headline: null, detail: text };
}

/** "(2026학년도) — 2024 1.03 → 2025 1.08 → 2026 1.18" → 학년도 라벨 + 연도별 값 + 나머지 메모 */
export function parseCompetitionDetail(detail: string) {
  const yearMatch = detail.match(/\((\d{4}학년도)(?:,\s*([^)]*))?\)/);
  const yearLabel = yearMatch?.[1] ?? null;
  const trend = detail.includes('→')
    ? [...detail.matchAll(/(\d{4})\s+(\d+(?:\.\d+)?)/g)].map((m) => ({ year: m[1], value: Number(m[2]) }))
    : [];
  const hasTrend = trend.length > 1;
  let note = yearMatch ? detail.replace(yearMatch[0], yearMatch[2] ?? '') : detail;
  if (hasTrend) note = note.replace(/\d{4}\s+\d+(?:\.\d+)?(\s*→\s*\d{4}\s+\d+(?:\.\d+)?)+/, '');
  // 추이를 빼고 나면 "정원내 — — 메모"처럼 구분자가 겹치므로 하나로 접는다
  note = note.replace(/(\s*—\s*)+/g, ' — ').replace(/^[\s—,·]+|[\s—,·]+$/g, '');
  return { yearLabel, trend: hasTrend ? trend : [], note };
}
