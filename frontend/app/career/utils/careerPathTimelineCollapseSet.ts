/**
 * 탐색·내 패스 타임라인에서 학년/목표 아코디언 접힘 상태(Set) 토글 공통 로직
 */
export function toggleCollapseSetKey(previousCollapsedKeys: Set<string>, key: string): Set<string> {
  const next = new Set(previousCollapsedKeys);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}
