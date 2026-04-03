/** Django UUID primary key 형식인지 검사 (임시 `from-template-...` id 제외용) */
export function isUuidString(id: string | undefined | null): boolean {
  if (id == null || typeof id !== 'string') return false;
  const t = id.trim();
  if (!t) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    t
  );
}
